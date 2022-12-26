extern crate alloc;

use crate::types::{fp_decode, fp_encode, FullIncomingNote, OutgoingNote, Utxo, FP_DECODE, FP_ENCODE};
use alloc::{vec, vec::Vec};
use core::marker::PhantomData;
use manta_pay::{
    config::{self, utxo::MerkleTreeConfiguration},
    manta_accounting::transfer::{
        receiver::{ReceiverLedger},
        sender::{SenderLedger},
    },
    manta_crypto::merkle_tree::{self, forest::Configuration as _},
    manta_parameters::{self, Get as _},
    manta_util::codec::Decode as _,
};
use crate::{Config, pallet::*};
use crate::common::{Wrap};


pub use crate::types::{Checkpoint, RawCheckpoint, PullResponse};

pub struct ProxyLedger<T>(pub PhantomData<T>)
    where
        T: Config;

impl<T> SenderLedger<config::Parameters> for ProxyLedger<T>
    where
        T: Config,
{
    type SuperPostingKey = (Wrap<()>, ());
    type ValidUtxoAccumulatorOutput = Wrap<config::UtxoAccumulatorOutput>;
    type ValidNullifier = Wrap<config::Nullifier>;

    #[inline]
    fn is_unspent(&self, nullifier: config::Nullifier) -> Option<Self::ValidNullifier> {
        if NullifierCommitmentSet::<T>::contains_key(
            fp_encode(nullifier.nullifier.commitment).ok()?,
        ) {
            None
        } else {
            Some(Wrap(nullifier))
        }
    }

    #[inline]
    fn has_matching_utxo_accumulator_output(
        &self,
        output: config::UtxoAccumulatorOutput,
    ) -> Option<Self::ValidUtxoAccumulatorOutput> {
        let accumulator_output = fp_encode(output).ok()?;
        // Checking for an empty(zeroed) byte array.
        // This happens for UTXOs with value = 0, for which you dont need
        // a membership proof, but you still need a root(in this case zeroed).
        if accumulator_output == [0u8; 32]
            || UtxoAccumulatorOutputs::<T>::contains_key(accumulator_output)
        {
            return Some(Wrap(output));
        }
        None
    }

    #[inline]
    fn spend_all<I>(&mut self, super_key: &Self::SuperPostingKey, iter: I)
        where
            I: IntoIterator<Item = (Self::ValidUtxoAccumulatorOutput, Self::ValidNullifier)>,
    {
        let _ = super_key;
        let index = NullifierSetSize::<T>::get();
        let mut i = 0;
        for (_, nullifier) in iter {
            let nullifier_commitment =
                fp_encode(nullifier.0.nullifier.commitment).expect(FP_ENCODE);
            NullifierCommitmentSet::<T>::insert(nullifier_commitment, ());
            NullifierSetInsertionOrder::<T>::insert(
                index + i,
                (
                    nullifier_commitment,
                    OutgoingNote::try_from(nullifier.0.outgoing_note)
                        .expect("Unable to decode the Outgoing Note."),
                ),
            );
            i += 1;
        }
        if i != 0 {
            NullifierSetSize::<T>::set(index + i);
        }
    }
}

impl<T> ReceiverLedger<config::Parameters> for ProxyLedger<T>
    where
        T: Config,
{
    type SuperPostingKey = (Wrap<()>, ());
    type ValidUtxo = Wrap<config::Utxo>;

    #[inline]
    fn is_not_registered(&self, utxo: config::Utxo) -> Option<Self::ValidUtxo> {
        if UtxoSet::<T>::contains_key(Utxo::try_from(utxo).ok()?) {
            None
        } else {
            Some(Wrap(utxo))
        }
    }

    #[inline]
    fn register_all<I>(&mut self, super_key: &Self::SuperPostingKey, iter: I)
        where
            I: IntoIterator<Item = (Self::ValidUtxo, config::Note)>,
    {
        let _ = super_key;
        let utxo_accumulator_model = config::UtxoAccumulatorModel::decode(
            manta_parameters::pay::testnet::parameters::UtxoAccumulatorModel::get()
                .expect("Checksum did not match."),
        )
            .expect("Unable to decode the Merkle Tree Parameters.");
        let utxo_accumulator_item_hash = config::utxo::UtxoAccumulatorItemHash::decode(
            manta_parameters::pay::testnet::parameters::UtxoAccumulatorItemHash::get()
                .expect("Checksum did not match."),
        )
            .expect("Unable to decode the Merkle Tree Item Hash.");
        let mut shard_indices = iter
            .into_iter()
            .map(|(utxo, note)| {
                (
                    MerkleTreeConfiguration::tree_index(
                        &utxo.0.item_hash(&utxo_accumulator_item_hash, &mut ()),
                    ),
                    utxo.0,
                    note,
                )
            })
            .collect::<Vec<_>>();
        shard_indices.sort_by_key(|(s, _, _)| *s);
        let mut shard_insertions = Vec::<(_, Vec<_>)>::new();
        for (shard_index, utxo, note) in shard_indices {
            match shard_insertions.last_mut() {
                Some((index, pairs)) if shard_index == *index => pairs.push((utxo, note)),
                _ => shard_insertions.push((shard_index, vec![(utxo, note)])),
            }
        }
        for (shard_index, insertions) in shard_insertions {
            let mut tree = ShardTrees::<T>::get(shard_index);
            let cloned_tree = tree.clone();
            let mut next_root = Option::<config::UtxoAccumulatorOutput>::None;
            let mut current_path = cloned_tree
                .current_path
                .try_into()
                .expect("Unable to decode the Current Path.");
            let mut leaf_digest = tree
                .leaf_digest
                .map(|x| fp_decode(x.to_vec()).expect(FP_DECODE));
            for (utxo, note) in insertions {
                next_root = Some(
                    merkle_tree::single_path::raw::insert(
                        &utxo_accumulator_model,
                        &mut leaf_digest,
                        &mut current_path,
                        utxo.item_hash(&utxo_accumulator_item_hash, &mut ()),
                    )
                        .expect("If this errors, then we have run out of Merkle Tree capacity."),
                );
                let next_index = current_path.leaf_index().0 as u64;
                let utxo = Utxo::try_from(utxo).expect("Unable to decode the Utxo");
                UtxoSet::<T>::insert(utxo, ());
                Shards::<T>::insert(
                    shard_index,
                    next_index,
                    (
                        utxo,
                        FullIncomingNote::try_from(note)
                            .expect("Unable to decode the Full Incoming Note."),
                    ),
                );
            }
            tree.current_path = current_path
                .try_into()
                .expect("Unable to decode the Current Path.");
            tree.leaf_digest = leaf_digest.map(|x| fp_encode(x).expect(FP_DECODE));
            if let Some(next_root) = next_root {
                ShardTrees::<T>::insert(shard_index, tree);
                UtxoAccumulatorOutputs::<T>::insert(fp_encode(next_root).expect(FP_ENCODE), ());
            }
        }
    }
}


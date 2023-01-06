#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

pub mod types;
pub use types::*;

pub mod functions;

pub mod traits;

#[frame_support::pallet]
pub mod pallet {
	use super::traits::OmniverseAccounts;
	use super::types::{OmniverseTokenProtocol, VerifyError, VerifyResult};
	use codec::{Decode, Encode};
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;
	use sp_io::crypto;
	use sp_std::vec::Vec;

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
	}

	#[pallet::type_value]
	pub fn GetDefaultValue() -> u128 {
		0
	}

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	#[pallet::without_storage_info]
	pub struct Pallet<T>(_);

	// The pallet's runtime storage items.
	// https://docs.substrate.io/v3/runtime/storage
	#[pallet::storage]
	#[pallet::getter(fn transaction_recorder)]
	// Learn more about declaring storage items:
	// https://docs.substrate.io/v3/runtime/storage#declaring-storage-items
	pub type TransactionRecorder<T: Config> =
		StorageDoubleMap<_, Blake2_128Concat, [u8; 64], Blake2_128Concat, u128, OmniverseTx>;

	#[pallet::storage]
	#[pallet::getter(fn transaction_count)]
	// Learn more about declaring storage items:
	// https://docs.substrate.io/v3/runtime/storage#declaring-storage-items
	pub type TransactionCount<T: Config> =
		StorageMap<_, Blake2_128Concat, [u8; 64], u128, ValueQuery, GetDefaultValue>;

	#[pallet::storage]
	#[pallet::getter(fn evil_recorder)]
	// Learn more about declaring storage items:
	// https://docs.substrate.io/v3/runtime/storage#declaring-storage-items
	pub type EvilRecorder<T: Config> = StorageMap<_, Blake2_128Concat, [u8; 64], Vec<EvilTxData>>;

	// Pallets use events to inform users when important changes are made.
	// https://docs.substrate.io/v3/runtime/events-and-errors
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		TransactionSent([u8; 64], u128),
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {}

	#[pallet::hooks]
	impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}

	#[pallet::call]
	impl<T: Config> Pallet<T> {}

	const CHAIN_ID: u8 = 1_u8;

	#[derive(Clone, PartialEq, Eq, Debug, Encode, Decode, TypeInfo)]
	pub struct OmniverseTx {
		tx_data: OmniverseTokenProtocol,
		timestamp: u128,
	}

	impl OmniverseTx {
		fn new(data: OmniverseTokenProtocol) -> Self {
			Self { tx_data: data, timestamp: 0 }
		}
	}

	#[derive(Clone, PartialEq, Eq, Debug, Encode, Decode, TypeInfo)]
	pub struct EvilTxData {
		tx_omni: OmniverseTx,
		his_nonce: u128,
	}

	impl EvilTxData {
		fn new(data: OmniverseTx, nonce: u128) -> Self {
			Self { tx_omni: data, his_nonce: nonce }
		}
	}

	impl<T: Config> OmniverseAccounts for Pallet<T> {
		fn verify_transaction(data: &OmniverseTokenProtocol) -> Result<VerifyResult, VerifyError> {
			let nonce = TransactionCount::<T>::get(&data.from);

			let tx_hash_bytes = super::functions::get_transaction_hash(&data);

			let recoverd_pk = crypto::secp256k1_ecdsa_recover(&data.signature, &tx_hash_bytes)
				.map_err(|_| VerifyError::SignatureError)?;

			if recoverd_pk != data.from {
				return Err(VerifyError::SignerNotCaller);
			}

			// Check nonce
			if nonce == data.nonce {
				// Add to transaction recorder
				let omni_tx = OmniverseTx::new(data.clone());
				TransactionRecorder::<T>::insert(&data.from, &nonce, omni_tx);
				TransactionCount::<T>::insert(&data.from, nonce + 1);
				if data.chain_id == CHAIN_ID {
					Self::deposit_event(Event::TransactionSent(data.from, nonce));
				}
				Ok(VerifyResult::Success)
			} else if nonce > data.nonce {
				// Check conflicts
				let his_tx = TransactionRecorder::<T>::get(&data.from, &data.nonce).unwrap();
				let his_tx_hash = super::functions::get_transaction_hash(&his_tx.tx_data);
				if his_tx_hash != tx_hash_bytes {
					let omni_tx = OmniverseTx::new(data.clone());
					let evil_tx = EvilTxData::new(omni_tx, nonce);
					let mut er =
						EvilRecorder::<T>::get(&data.from).unwrap_or(Vec::<EvilTxData>::default());
					er.push(evil_tx);
					EvilRecorder::<T>::insert(&data.from, er);
					Ok(VerifyResult::Malicious)
				} else {
					Ok(VerifyResult::Duplicated)
				}
			} else {
				Err(VerifyError::NonceError)
			}
		}

		fn get_transaction_count(pk: [u8; 64]) -> u128 {
			Self::transaction_count(pk)
		}

		fn is_malicious(pk: [u8; 64]) -> bool {
			let record = Self::evil_recorder(pk);
			if let Some(r) = record {
				if r.len() > 0 {
					return true;
				}
			}

			false
		}

		fn get_chain_id() -> u8 {
			CHAIN_ID
		}
	}
}

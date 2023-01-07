#![cfg_attr(not(feature = "std"), no_std)]

use frame_support::traits::{Currency, ExistenceRequirement};
use core::marker::PhantomData;
use fp_evm::{
    Context, ExitError, ExitSucceed, PrecompileOutput
};
use pallet_evm::{
    Precompile, AddressMapping, PrecompileFailure, PrecompileResult
};
use sp_core::{H160, U256, hexdisplay::HexDisplay};
use sp_runtime::{traits::UniqueSaturatedInto, AccountId32};
use codec::{Encode, Decode};
use frame_support::log;
pub use sp_mvm::SpMVM;
use sp_std::vec;

pub struct MVM<T: pallet_evm::Config + sp_mvm::Config> {
    _marker: PhantomData<T>,
}


impl<T: pallet_evm::Config + sp_mvm::Config> MVM<T>
{
    fn process(
        input: &[u8],
        context: &Context,
    ) -> Result<bool, PrecompileFailure> {
        log::debug!(target: "sp-mvm", "call");

        let origin = T::AddressMapping::into_account_id(context.caller);
        let account_bytes: [u8; 32] = origin.encode()[0..32].try_into().unwrap();
        log::info!("input ------ {:?}",input);
        log::info!("{:?}",account_bytes);
        log::info!("{:?}",origin);
        log::info!("{:?}",context.caller);
        T::SpMVM::raw_execute_script(
            &[],
            input.to_vec(),
            400,
            false,
            false
        )
            .map(|_| true)
            .map_err(|err| {
                PrecompileFailure::Error { exit_status: ExitError::InvalidCode }
            })
    }
}

impl<T> Precompile for MVM<T>
    where
        T: pallet_evm::Config + sp_mvm::Config,
        T::AccountId: Decode,
{
    fn execute(
        input: &[u8],
        _target_gas: Option<u64>,
        context: &Context,
        _is_static: bool,
    ) -> PrecompileResult {

        log::debug!(target: "coming-nft", "caller: {:?}", context.caller);

        const BASE_GAS_COST: u64 = 450_000;

        // Refer: https://github.com/rust-ethereum/ethabi/blob/master/ethabi/src/encoder.rs#L144
        let mut out = vec![0u8;32];

        if Self::process(input, context)? {
            out[31] = 1u8;
        }

        Ok(PrecompileOutput {
            exit_status: ExitSucceed::Returned,
            cost: BASE_GAS_COST,
            output: out.to_vec(),
            logs: Default::default(),
        })
    }
}
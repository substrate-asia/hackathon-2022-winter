// Copyright 2019-2021 PureStake Inc.
// This file is part of Moonbeam.

// Moonbeam is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Moonbeam is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Moonbeam.  If not, see <http://www.gnu.org/licenses/>.

use fp_evm::Context;
use frame_support::log;
use frame_support::log::log;
use pallet_evm::{Precompile, PrecompileResult, PrecompileSet};
use pallet_evm_precompile_dispatch::Dispatch;
use pallet_evm_precompile_modexp::Modexp;
use pallet_evm_precompile_sha3fips::Sha3FIPS256;
use pallet_evm_precompile_simple::{ECRecover, ECRecoverPublicKey, Identity, Ripemd160, Sha256};
use sp_core::H160;
use sp_std::marker::PhantomData;

/// We include the nine Istanbul precompiles
/// (https://github.com/ethereum/go-ethereum/blob/3c46f557/core/vm/contracts.go#L69)
/// as well as a special precompile for dispatching Substrate extrinsics
pub struct MoereumPrecompiles<R>(PhantomData<R>);

impl<R> MoereumPrecompiles<R>
	where
		R: pallet_evm::Config,
{
	#[allow(clippy::new_without_default)]
	pub fn new() -> Self {
		Self(PhantomData::<R>)
	}
	/// Return all addresses that contain precompiles. This can be used to populate dummy code
	/// under the precompile.
	pub fn used_addresses() -> sp_std::vec::Vec<H160> {
		sp_std::vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 1024, 1025, 1026, 2048]
			.into_iter()
			.map(hash)
			.collect()
	}
}

/// The following distribution has been decided for the precompiles
/// 0-1023: Ethereum Mainnet Precompiles
/// 1024-2047 Precompiles that are not in Ethereum Mainnet but are neither Minix specific
/// 2048-4095 Minix specific precompiles
impl<R> PrecompileSet for MoereumPrecompiles<R>
	where
		R: pallet_evm::Config + sp_mvm::Config,
		Dispatch<R>: Precompile,
{
	fn execute(
		&self,
		address: H160,
		input: &[u8],
		target_gas: Option<u64>,
		context: &Context,
		is_static: bool,
	) -> Option<PrecompileResult> {
		log::info!("hash  ---- {:?}",hash(2048));
		match address {
			// Ethereum precompiles :
			a if a == hash(1) => Some(ECRecover::execute(input, target_gas, context, is_static)),
			a if a == hash(2) => Some(Sha256::execute(input, target_gas, context, is_static)),
			a if a == hash(3) => Some(Ripemd160::execute(input, target_gas, context, is_static)),
			a if a == hash(4) => Some(Identity::execute(input, target_gas, context, is_static)),
			a if a == hash(5) => Some(Modexp::execute(input, target_gas, context, is_static)),

			// Non-Minix specific nor Ethereum precompiles :
			a if a == hash(1024) => {
				Some(Sha3FIPS256::execute(input, target_gas, context, is_static))
			}
			a if a == hash(1025) => Some(Dispatch::<R>::execute(
				input, target_gas, context, is_static,
			)),
			a if a == hash(1026) => Some(ECRecoverPublicKey::execute(
				input, target_gas, context, is_static,
			)),

			// Minix specific precompiles :
			a if a == hash(2048) => Some(crate::move_vm::MVM::<R>::execute(
				input, target_gas, context, is_static
			)),
			_ => None,
		}
	}
	fn is_precompile(&self, address: H160) -> bool {
		Self::used_addresses().contains(&address)
	}
}

fn hash(a: u64) -> H160 {
	H160::from_low_u64_be(a)
}
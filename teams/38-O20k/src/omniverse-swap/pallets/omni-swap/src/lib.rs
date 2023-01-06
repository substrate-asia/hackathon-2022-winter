#![cfg_attr(not(feature = "std"), no_std)]

/// Edit this file to define custom logic or remove it if it is not needed.
/// Learn more about FRAME and the core library of Substrate FRAME pallets:
/// <https://docs.substrate.io/reference/frame-pallets/>
pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

#[frame_support::pallet]
pub mod pallet {
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;
	use sp_std::vec::Vec;
	// use sp_runtime::traits::TrailingZeroInput;
	use pallet_assets::traits::OmniverseTokenFactoryHandler;
	use pallet_omniverse_protocol::{
		OmniverseTokenProtocol, TokenOpcode, TransferTokenOp, TRANSFER,
	};
	use sp_runtime::traits::IntegerSquareRoot;

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	#[pallet::without_storage_info]
	pub struct Pallet<T>(_);

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		type OmniverseToken: OmniverseTokenFactoryHandler;
	}

	#[pallet::storage]
	#[pallet::getter(fn trading_pairs)]
	pub type TradingPairs<T: Config> = StorageMap<_, Blake2_128Concat, Vec<u8>, (u128, u128)>;

	#[pallet::storage]
	#[pallet::getter(fn total_liquidity)]
	pub type TotalLiquidity<T: Config> = StorageMap<_, Blake2_128Concat, Vec<u8>, u128>;

	#[pallet::storage]
	#[pallet::getter(fn liquidity)]
	pub type Liquidity<T: Config> = StorageMap<_, Blake2_128Concat, (Vec<u8>, [u8; 64]), u128>;

	#[pallet::storage]
	#[pallet::getter(fn balance)]
	pub type Balance<T: Config> =
		StorageMap<_, Blake2_128Concat, (Vec<u8>, [u8; 64]), (u128, u128)>;

	#[pallet::storage]
	#[pallet::getter(fn token_id)]
	pub type TokenId<T: Config> = StorageMap<_, Blake2_128Concat, Vec<u8>, (Vec<u8>, Vec<u8>)>;
	// #[pallet::storage]
	// #[pallet::getter(fn public_key)]
	// pub type PublicKey<T:Config> = StorageMap<_, Blake2_128Concat, T::AccountId, [u8; 64]>;

	// Pallets use events to inform users when important changes are made.
	// https://docs.substrate.io/main-docs/build/events-errors/
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Event documentation should end with an array that provides descriptive names for event
		SwapX2YTokens(Vec<u8>, [u8; 64], u128, u128),
		SwapY2XTokens(Vec<u8>, [u8; 64], u128, u128),
		AddLiquidity(Vec<u8>, [u8; 64], u128, u128),
		RemoveLiquidity(Vec<u8>, [u8; 64], u128, u128),
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		/// Error names should be descriptive.
		NoneValue,
		/// Errors should have helpful documentation associated with them.
		StorageOverflow,
		InvalidValue,
		TradingPairNotExist,
		InsufficientBAmount,
		InsufficientAAmount,
		ExceedDesiredAmount,
		GetAddress0Failed,
		InsufficientLiquidity,
		InsufficientAmount,
		OmniverseTransferXFailed,
		OmniverseTransferYFailed,
		TokenIdNotExist,
		MismatchTokenId,
		InsufficientOmniverseTransferAmount,
		NotOmniverseTransfer,
		GetXTokenLessThenDesired,
		GetYTokenLessThenDesired,
		PublicKeyNotExist,
		MismatchReceiptor,
	}

	// Dispatchable functions allows users to interact with the pallet and invoke state changes.
	// These functions materialize as "extrinsics", which are often compared to transactions.
	// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// Convert X token to Y token
		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn swap_x2y(
			origin: OriginFor<T>,
			trading_pair: Vec<u8>,
			tokens_sold: u128,
			min_token: u128,
			token_x_id: Vec<u8>,
			token_x_data: OmniverseTokenProtocol,
		) -> DispatchResult {
			ensure_signed(origin)?;
			ensure!(tokens_sold > 0 && min_token > 0, Error::<T>::InvalidValue);
			// if !PublicKey::<T>::contains_key(&sender) {
			// 	<PublicKey<T>>::insert(&sender, token_x_data.from);
			// }
			// Transfer X token to MPC account
			T::OmniverseToken::send_transaction_external(token_x_id, &token_x_data)
				.ok()
				.ok_or(Error::<T>::OmniverseTransferXFailed)?;

			let (reserve_x, reserve_y) =
				TradingPairs::<T>::get(&trading_pair).ok_or(Error::<T>::TradingPairNotExist)?;
			let tokens_bought: u128 = get_input_price(tokens_sold, reserve_x, reserve_y);
			ensure!(tokens_bought >= min_token, Error::<T>::GetYTokenLessThenDesired);
			<TradingPairs<T>>::insert(
				&trading_pair,
				(reserve_x + tokens_sold, reserve_y - tokens_bought),
			);

			let key = (trading_pair.clone(), token_x_data.from);
			if let Some((balance_x, mut balance_y)) = Balance::<T>::get(&key) {
				balance_y = balance_y + tokens_bought;
				<Balance<T>>::insert(&key, (balance_x, balance_y));
			} else {
				<Balance<T>>::insert(&key, (0u128, tokens_bought));
			}

			Self::deposit_event(Event::SwapX2YTokens(
				trading_pair,
				token_x_data.from,
				tokens_sold,
				tokens_bought,
			));
			Ok(())
		}

		/// Convert Y token to X token
		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn swap_y2x(
			origin: OriginFor<T>,
			trading_pair: Vec<u8>,
			tokens_sold: u128,
			min_token: u128,
			token_y_id: Vec<u8>,
			token_y_data: OmniverseTokenProtocol,
		) -> DispatchResult {
			ensure_signed(origin)?;
			ensure!(tokens_sold > 0 && min_token > 0, Error::<T>::InvalidValue);
			// if !PublicKey::<T>::contains_key(&sender) {
			// 	<PublicKey<T>>::insert(&sender, token_y_data.from);
			// }
			// Transfer Y token to MPC account
			T::OmniverseToken::send_transaction_external(token_y_id, &token_y_data)
				.ok()
				.ok_or(Error::<T>::OmniverseTransferYFailed)?;

			let (reserve_x, reserve_y) =
				TradingPairs::<T>::get(&trading_pair).ok_or(Error::<T>::TradingPairNotExist)?;
			let tokens_bought = get_input_price(tokens_sold, reserve_y, reserve_x);
			ensure!(tokens_bought >= min_token, Error::<T>::GetXTokenLessThenDesired);
			<TradingPairs<T>>::insert(
				&trading_pair,
				(reserve_x - tokens_bought, reserve_y + tokens_sold),
			);

			let key = (trading_pair.clone(), token_y_data.from);
			if let Some((mut balance_x, balance_y)) = Balance::<T>::get(&key) {
				balance_x = balance_x + tokens_bought;
				<Balance<T>>::insert(&key, (balance_x, balance_y));
			} else {
				<Balance<T>>::insert(&key, (tokens_bought, 0u128));
			}

			Self::deposit_event(Event::SwapY2XTokens(
				trading_pair,
				token_y_data.from,
				tokens_sold,
				tokens_bought,
			));
			Ok(())
		}

		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn add_liquidity(
			origin: OriginFor<T>,
			trading_pair: Vec<u8>,
			amount_x_desired: u128,
			amount_y_desired: u128,
			amount_x_min: u128,
			amount_y_min: u128,
			token_x_id: Vec<u8>,
			token_x_data: OmniverseTokenProtocol,
			token_y_id: Vec<u8>,
			token_y_data: OmniverseTokenProtocol,
		) -> DispatchResult {
			ensure_signed(origin)?;
			ensure!(amount_x_desired > 0 && amount_y_desired > 0, Error::<T>::InvalidValue);

			// if !PublicKey::<T>::contains_key(&sender) {
			// 	<PublicKey<T>>::insert(&sender, token_x_data.from);
			// }
			if !TokenId::<T>::contains_key(&trading_pair) {
				<TokenId<T>>::insert(&trading_pair, (token_x_id.clone(), token_y_id.clone()));
			}

			let tranding_pair = TradingPairs::<T>::get(&trading_pair);
			let amount_x: u128;
			let amount_y: u128;
			if tranding_pair.is_some() {
				let (reserve_x, reserve_y) =
					TradingPairs::<T>::get(&trading_pair).ok_or(Error::<T>::TradingPairNotExist)?;
				let amount_y_optimal = quote(amount_x_desired, reserve_x, reserve_y);
				if amount_y_optimal <= amount_y_desired {
					ensure!(
						amount_y_optimal > 0 && amount_y_min > 0,
						Error::<T>::InsufficientBAmount
					);
					amount_x = amount_x_desired;
					amount_y = amount_y_optimal;
				} else {
					let amount_x_optimal = quote(amount_y_desired, reserve_y, reserve_x);
					ensure!(amount_x_optimal <= amount_x_desired, Error::<T>::ExceedDesiredAmount);
					ensure!(
						amount_x_optimal > 0 && amount_x_min > 0,
						Error::<T>::InsufficientAAmount
					);
					amount_x = amount_x_optimal;
					amount_y = amount_y_desired;
				}
				<TradingPairs<T>>::insert(
					&trading_pair,
					(reserve_x + amount_x, reserve_y + amount_y),
				);
			} else {
				amount_x = amount_x_desired;
				amount_y = amount_y_desired;
				<TradingPairs<T>>::insert(&trading_pair, (amount_x, amount_y));
				<TotalLiquidity<T>>::insert(&trading_pair, 0u128);
			}

			let op_data_x = TokenOpcode::decode(&mut token_x_data.data.as_slice()).unwrap();
			let op_data_y = TokenOpcode::decode(&mut token_y_data.data.as_slice()).unwrap();
			ensure!(
				op_data_x.op == TRANSFER && op_data_y.op == TRANSFER,
				Error::<T>::NotOmniverseTransfer
			);
			let transfer_data_x = TransferTokenOp::decode(&mut op_data_x.data.as_slice()).unwrap();
			let transfer_data_y = TransferTokenOp::decode(&mut op_data_y.data.as_slice()).unwrap();
			ensure!(
				transfer_data_x.amount >= amount_x && transfer_data_y.amount >= amount_y,
				Error::<T>::InsufficientOmniverseTransferAmount
			);
			let key = (trading_pair.clone(), token_x_data.from);

			// The redundant token transferred needs to be returned to the user.
			if let Some((mut balance_x, mut balance_y)) = Balance::<T>::get(&key) {
				balance_x = balance_x + transfer_data_x.amount - amount_x;
				balance_y = balance_y + transfer_data_y.amount - amount_y;
				<Balance<T>>::insert(&key, (balance_x, balance_y));
			} else {
				<Balance<T>>::insert(
					&key,
					(transfer_data_x.amount - amount_x, transfer_data_y.amount - amount_y),
				);
			}

			// transfer X token and Y token to MPC address
			T::OmniverseToken::send_transaction_external(token_x_id, &token_x_data)
				.ok()
				.ok_or(Error::<T>::OmniverseTransferXFailed)?;
			T::OmniverseToken::send_transaction_external(token_y_id, &token_y_data)
				.ok()
				.ok_or(Error::<T>::OmniverseTransferYFailed)?;

			// mint
			let (balance_x, balance_y) =
				TradingPairs::<T>::get(&trading_pair).ok_or(Error::<T>::TradingPairNotExist)?;
			let mut total_supply =
				TotalLiquidity::<T>::get(&trading_pair).ok_or(Error::<T>::TradingPairNotExist)?;
			let liquidity: u128;
			if total_supply == 0 {
				liquidity = (amount_x * amount_y).integer_sqrt().saturating_sub(1000);
				total_supply = liquidity;
			} else {
				// liquidity = Math.min(amount0.mul(_totalSupply) / _reserve0, amount1.mul(_totalSupply) / _reserve1);
				liquidity = (amount_x.saturating_mul(total_supply) / (balance_x - amount_x))
					.min(amount_y.saturating_mul(total_supply) / (balance_y - amount_y));
				total_supply += liquidity;
			}
			let balances = Liquidity::<T>::get(&key).unwrap_or(0) + liquidity;
			<Liquidity<T>>::insert(&key, balances);
			<TotalLiquidity<T>>::insert(&trading_pair, total_supply);

			Self::deposit_event(Event::AddLiquidity(
				trading_pair,
				token_x_data.from,
				amount_x,
				amount_y,
			));
			Ok(())
		}

		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn remove_liquidity(
			origin: OriginFor<T>,
			trading_pair: Vec<u8>,
			public_key: [u8; 64],
			liquidity: u128,
			amount_x_min: u128,
			amount_y_min: u128,
		) -> DispatchResult {
			ensure_signed(origin)?;
			let key = (trading_pair.clone(), public_key);
			let balances = Liquidity::<T>::get(&key).unwrap_or(0);
			ensure!(balances >= liquidity, Error::<T>::InvalidValue);

			// burn
			let (reserve_x, reserve_y) =
				TradingPairs::<T>::get(&trading_pair).ok_or(Error::<T>::TradingPairNotExist)?;
			<Liquidity<T>>::insert(&key, balances - liquidity);
			let total_supply =
				TotalLiquidity::<T>::get(&trading_pair).ok_or(Error::<T>::TradingPairNotExist)?;
			let amount_x = liquidity.saturating_mul(reserve_x) / total_supply;
			let amount_y = liquidity.saturating_mul(reserve_y) / total_supply;
			ensure!(
				amount_x >= amount_x_min && amount_y >= amount_y_min,
				Error::<T>::InsufficientAmount
			);

			<TotalLiquidity<T>>::insert(&trading_pair, total_supply - liquidity);
			<TradingPairs<T>>::insert(&trading_pair, (reserve_x - amount_x, reserve_y - amount_y));
			// MPC transfer X and Y token to sender
			if let Some((mut balance_x, mut balance_y)) = Balance::<T>::get(&key) {
				balance_x = balance_x + amount_x;
				balance_y = balance_y + amount_y;
				<Balance<T>>::insert(&key, (balance_x, balance_y));
			} else {
				<Balance<T>>::insert(&key, (amount_x, amount_y));
			}

			Self::deposit_event(Event::RemoveLiquidity(
				trading_pair,
				public_key,
				amount_x,
				amount_y,
			));
			Ok(())
		}

		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn transfer_x_token(
			origin: OriginFor<T>,
			trading_pair: Vec<u8>,
			data: OmniverseTokenProtocol,
		) -> DispatchResult {
			ensure_signed(origin)?;
			// TODO `to` need equal to `transfer_data.to` and token id equal balance_y
			let op_data = TokenOpcode::decode(&mut data.data.as_slice()).unwrap();
			if op_data.op == TRANSFER {
				let transfer_data = TransferTokenOp::decode(&mut op_data.data.as_slice()).unwrap();
				let key = (trading_pair.clone(), transfer_data.to);
				if let Some((balance_x, balance_y)) = Balance::<T>::get(&key) {
					ensure!(transfer_data.amount <= balance_x, Error::<T>::InsufficientAmount);
					let (token_x_id, _) =
						TokenId::<T>::get(&trading_pair).ok_or(Error::<T>::TokenIdNotExist)?;
					ensure!(data.to == token_x_id, Error::<T>::MismatchTokenId);
					T::OmniverseToken::send_transaction_external(token_x_id, &data)
						.ok()
						.ok_or(Error::<T>::OmniverseTransferXFailed)?;
					<Balance<T>>::insert(&key, (balance_x - transfer_data.amount, balance_y));
				}
			}
			Ok(())
		}

		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn transfer_y_token(
			origin: OriginFor<T>,
			trading_pair: Vec<u8>,
			data: OmniverseTokenProtocol,
		) -> DispatchResult {
			ensure_signed(origin)?;
			// TODO `to` need equal to `transfer_data.to` and token id equal balance_y
			let op_data = TokenOpcode::decode(&mut data.data.as_slice()).unwrap();
			if op_data.op == TRANSFER {
				let transfer_data = TransferTokenOp::decode(&mut op_data.data.as_slice()).unwrap();
				let key = (trading_pair.clone(), transfer_data.to);
				if let Some((balance_x, balance_y)) = Balance::<T>::get(&key) {
					ensure!(transfer_data.amount <= balance_y, Error::<T>::InsufficientAmount);
					let (_, token_y_id) =
						TokenId::<T>::get(&trading_pair).ok_or(Error::<T>::TokenIdNotExist)?;
					ensure!(data.to == token_y_id, Error::<T>::MismatchTokenId);
					T::OmniverseToken::send_transaction_external(token_y_id, &data)
						.ok()
						.ok_or(Error::<T>::OmniverseTransferYFailed)?;
					<Balance<T>>::insert(&key, (balance_x, balance_y - transfer_data.amount));
				}
			}
			Ok(())
		}
	}

	// impl<T: Config> Pallet<T> {
	pub fn get_input_price(input_amount: u128, input_reserve: u128, output_reserve: u128) -> u128 {
		// ensure!(input_reserve > 0 && output_reserve > 0u128);
		let numerator: u128 = input_amount * output_reserve;
		let denominator: u128 = input_reserve + input_amount;
		numerator / denominator
	}

	pub fn get_output_price(output_amout: u128, input_reserve: u128, output_reserve: u128) -> u128 {
		// ensure!(input_reserve > 0u128 && output_reserve > 0u128);
		let numerator: u128 = input_reserve * output_amout;
		let denominator: u128 = output_reserve - output_amout;
		numerator / denominator
	}

	/// given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
	pub fn quote(amount_x: u128, reserve_x: u128, reserve_y: u128) -> u128 {
		amount_x * reserve_y / reserve_x
	}
	// }
}

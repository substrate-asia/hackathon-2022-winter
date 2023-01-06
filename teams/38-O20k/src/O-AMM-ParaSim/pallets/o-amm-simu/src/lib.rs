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
	use codec::{Encode, Decode};

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	#[pallet::without_storage_info]
	pub struct Pallet<T>(_);

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
	}

	// The pallet's runtime storage items.
	// https://docs.substrate.io/main-docs/build/runtime-storage/
	#[pallet::storage]
	#[pallet::getter(fn something)]
	// Learn more about declaring storage items:
	// https://docs.substrate.io/main-docs/build/runtime-storage/#declaring-storage-items
	pub type Something<T> = StorageValue<_, u32>;

	#[pallet::storage]
	#[pallet::getter(fn token_pools)]
	pub type TokenPool<T> = StorageMap<_, Blake2_128Concat, Vec<u8>, PoolInfo>;

	#[derive(Clone, PartialEq, Eq, Debug, Encode, Decode, TypeInfo)]
	pub struct TokenInfo {
		t_name: Vec<u8>,
		t_amount: u128
	}

	impl TokenInfo {
		pub fn new(t_name: Vec<u8>, t_amount: u128)-> Self {
			TokenInfo {
				t_name,
				t_amount
			}
		}
	}

	#[derive(Clone, PartialEq, Eq, Debug, Encode, Decode, TypeInfo)]
	pub struct PoolInfo {
		token_pair: (TokenInfo, TokenInfo),
		b_10000: u128,
		c: u128,
		swap_precision: u128
	}

	impl PoolInfo {
		pub fn new(token1: TokenInfo, token2: TokenInfo)-> Self {
			let mut p_info = PoolInfo {
				token_pair: (token1, token2),
				b_10000: 0,
				c: 0,
				swap_precision: 10000
			};

			p_info._re_calculate_b_c();
			p_info
		}

		/// the precision of `d_in`, `d_out` and `virtual_out` are both 0.0001, that is,
		/// 
		/// when the input is `12345678`, the real numerical value is `1234.5678`
		/// 
		pub fn swap(&mut self, d_in: TokenInfo, d_out: TokenInfo, virtual_out: u128)-> bool {
			let mut in_t_amount = self.get_token(&d_in.t_name).unwrap().t_amount * self.swap_precision;
			if self._validate(in_t_amount, virtual_out) {
				in_t_amount += d_in.t_amount;
				let out_t_amount = virtual_out - d_out.t_amount;

				if self._validate(in_t_amount, out_t_amount) {
					self._set_token(d_in.t_name, in_t_amount / self.swap_precision);

					let real_out = self.get_token(&d_out.t_name).unwrap().t_amount - d_out.t_amount / self.swap_precision;
					self._set_token(d_out.t_name, real_out);
					return true;
				}
			}

			false
		}

		pub fn _validate(&self, in_t_amount: u128, out_t_amount: u128)-> bool {
			let m: u128 = in_t_amount * out_t_amount;
			let s: u128 = in_t_amount + out_t_amount;

			let coe: u128 = 100000000;

			let a: u128 = 4 * m * coe / (s * s);

			let p2: u128 = self.swap_precision * self.swap_precision;

			// let ms = m * s;
			// let l = ms + a * 2 * s * ms / coe + self.c * s * a / coe;
			// let r = a * ms / coe + a * 2 * self.b * ms / coe + self.c * s;

			let l: u128 = 2 * m / p2 + a * (in_t_amount * in_t_amount + out_t_amount * out_t_amount) / (coe * p2) + 2 * a * self.c / coe;
			let r: u128 = a * self.b_10000 * s / (coe * p2) + 2 * self.c;

			let mut delta = 0;
			if l > r {
				delta = l - r;
			} else if r > l {
				delta = r - l;
			}

			if delta < 10 {
				true
			} else {
				false
			}
		}

		fn _set_token(&mut self, t_name: Vec<u8>, t_value: u128)-> bool {
			if self.token_pair.0.t_name == t_name {
				self.token_pair.0.t_amount = t_value;
				true
			} else if self.token_pair.1.t_name == t_name {
				self.token_pair.1.t_amount = t_value;
				true
			} else {
				false
			}
		}

		fn _re_calculate_b_c(&mut self) {
			self.c = self.token_pair.0.t_amount * self.token_pair.1.t_amount;
			self.b_10000 = 2 * sqrt(self.c * 100000000);
		}

		pub fn reset(&mut self, token1: TokenInfo, token2: TokenInfo) {
			self.token_pair.0 = token1;
			self.token_pair.1 = token2;
			self._re_calculate_b_c();
		}

		pub fn get_token_pair(&self)-> (TokenInfo, TokenInfo) {
			self.token_pair.clone()
		}

		pub fn get_token(&self, t_name: &Vec<u8>)-> Option<TokenInfo> {
			if self.token_pair.0.t_name == *t_name {
				Some(self.token_pair.0.clone())
			} else if self.token_pair.1.t_name == *t_name {
				Some(self.token_pair.1.clone())
			} else {
				None
			}
		}
	}

	// Pallets use events to inform users when important changes are made.
	// https://docs.substrate.io/main-docs/build/events-errors/
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Event documentation should end with an array that provides descriptive names for event
		/// parameters. [something, who]
		SomethingStored { something: u32, who: T::AccountId },
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		/// Error names should be descriptive.
		NoneValue,
		/// Errors should have helpful documentation associated with them.
		StorageOverflow,
		TokenNotExist,
		InvalidAmount,
		PoolAlreadyExist,
		PoolNotExist,
	}

	// Dispatchable functions allows users to interact with the pallet and invoke state changes.
	// These functions materialize as "extrinsics", which are often compared to transactions.
	// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// An example dispatchable that takes a singles value as a parameter, writes the value to
		/// storage and emits an event. This function must be dispatched by a signed extrinsic.
		#[pallet::call_index(0)]
		#[pallet::weight(10_000 + T::DbWeight::get().writes(1).ref_time())]
		pub fn do_something(origin: OriginFor<T>, something: u32) -> DispatchResult {
			// Check that the extrinsic was signed and get the signer.
			// This function will return an error if the extrinsic is not signed.
			// https://docs.substrate.io/main-docs/build/origins/
			let who = ensure_signed(origin)?;

			// Update storage.
			<Something<T>>::put(something);

			// Emit an event.
			Self::deposit_event(Event::SomethingStored { something, who });
			// Return a successful DispatchResultWithPostInfo
			Ok(())
		}

		/// An example dispatchable that may throw a custom error.
		#[pallet::call_index(1)]
		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn cause_error(origin: OriginFor<T>) -> DispatchResult {
			let _who = ensure_signed(origin)?;

			// Read a value from storage.
			match <Something<T>>::get() {
				// Return an error if the value has not been set.
				None => return Err(Error::<T>::NoneValue.into()),
				Some(old) => {
					// Increment the value read from storage; will error in the event of overflow.
					let new = old.checked_add(1).ok_or(Error::<T>::StorageOverflow)?;
					// Update the value in storage with the incremented result.
					<Something<T>>::put(new);
					Ok(())
				},
			}
		}

		#[pallet::call_index(2)]
		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn create_swap_pool(origin: OriginFor<T>, pool_name: Vec<u8>, token1: TokenInfo, token2: TokenInfo) -> DispatchResult {
			let _who = ensure_signed(origin)?;

			ensure!(!TokenPool::<T>::contains_key(&pool_name), Error::<T>::PoolAlreadyExist);

			TokenPool::<T>::insert(&pool_name, PoolInfo::new(token1, token2));

			Ok(())
		}

		/// the precision of `d_in`, `d_out` and `virtual_out` are both 0.0001
		/// 
		/// For example, when the input is `12345678`, the real numerical value is `1234.5678`
		/// 
		#[pallet::call_index(3)]
		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1).ref_time())]
		pub fn swap(origin: OriginFor<T>, pool_name: Vec<u8>, d_in: TokenInfo, d_out: TokenInfo, virtual_out: u128) -> DispatchResult {
			let _who = ensure_signed(origin)?;

			// ensure!(TokenPool::<T>::contains_key(&pool_name), Error::<T>::PoolNotExist);

			let mut swap_pool = TokenPool::<T>::get(&pool_name).ok_or(Error::<T>::PoolNotExist)?;
			if swap_pool.swap(d_in, d_out, virtual_out) {
				TokenPool::<T>::insert(&pool_name, swap_pool);
				
				Ok(())
			} else {
				Err(Error::<T>::InvalidAmount.into())
			}
		}
	}

	fn sqrt(d: u128)-> u128 {
        if d > 3 {
            let mut z = d;
            let mut x = d / 2;
            while x < z {
                z = x;
                // The same as `x = x + (y - x * x) / (2 * x);`
                x = (d / x + x) / 2;
            }

            return z;
        } else {
			return 1;
		}
	}
}

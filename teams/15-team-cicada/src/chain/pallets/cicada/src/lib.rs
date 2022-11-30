#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

// #[cfg(test)]
// mod mock;

// #[cfg(test)]
// mod tests;

// #[cfg(feature = "runtime-benchmarks")]
// mod benchmarking;

use sp_std::prelude::*;

#[frame_support::pallet]
pub mod pallet {
	// use core::{convert::TryInto, fmt};
	// use codec::{Decode, Encode};

	use super::*;
	use frame_support::sp_io;
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;
	use sp_io::hashing::keccak_256;

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;

		#[pallet::constant]
		type CategoryMinLength: Get<u32>;
		#[pallet::constant]
		type CategoryMaxLength: Get<u32>;

		#[pallet::constant]
		type LabelMinLength: Get<u32>;
		#[pallet::constant]
		type LabelMaxLength: Get<u32>;

		#[pallet::constant]
		type SubjectMinLength: Get<u32>;
		#[pallet::constant]
		type SubjectMaxLength: Get<u32>;

		#[pallet::constant]
		type DimensionMinLength: Get<u32>;
		#[pallet::constant]
		type DimensionMaxLength: Get<u32>;

		#[pallet::constant]
		type ContentMinLength: Get<u32>;
		#[pallet::constant]
		type ContentMaxLength: Get<u32>;
	}

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	pub struct Pallet<T>(_);

	#[pallet::storage]
	#[pallet::getter(fn get_category)]
	pub type Categories<T: Config> =
		StorageMap<_, Identity, [u8; 32], (T::AccountId, bool)>;

	#[pallet::storage]
	#[pallet::getter(fn get_label)]
	pub type Labels<T: Config> =
		StorageMap<_, Identity, [u8; 32], (T::AccountId, bool)>;

	#[pallet::storage]
	#[pallet::getter(fn get_subject)]
	pub type Subjects<T: Config> =
		StorageMap<_, Identity, [u8; 32], (T::AccountId, bool)>;

	#[pallet::storage]
	#[pallet::getter(fn get_dimension)]
	pub type Dimensions<T: Config> =
		StorageMap<_, Identity, [u8; 32], (T::AccountId, bool)>;

	#[pallet::storage]
	#[pallet::getter(fn get_content)]
	pub type Contents<T: Config> =
		StorageMap<_, Identity, [u8; 32], (T::AccountId, bool)>;

	// Pallets use events to inform users when important changes are made.
	// https://docs.substrate.io/v3/runtime/events-and-errors
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		CategoryCreated{ hash: [u8; 32], name: Vec<u8>, parent: [u8; 32], who: T::AccountId, verified: bool },
		LabelCreated{ hash: [u8; 32], name: Vec<u8>, category: [u8; 32], who: T::AccountId, verified: bool  },
		SubjectCreated{ hash: [u8; 32], name: Vec<u8>, category: [u8; 32], who: T::AccountId, verified: bool  },
		DimensionCreated{ hash: [u8; 32], name: Vec<u8>, subject: [u8; 32], who: T::AccountId, verified: bool  },

		ContentCreated{ hash: [u8; 32], category: [u8; 32], label: [u8; 32], subject: [u8; 32], dimension: [u8; 32], content: Vec<u8>, who: T::AccountId, verified: bool },
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		TooShort,
		TooLong,
		NoneValue,
		CategoryAlreadyExist,
		CategoryNotExist,
		LabelAlreadyExist,
		LabelNotExist,
		SubjectAlreadyExist,
		SubjectNotExist,
		DimensionAlreadyExist,
		DimensionNotExist
	}

	// Dispatchable functions allows users to interact with the pallet and invoke state changes.
	// These functions materialize as "extrinsics", which are often compared to transactions.
	// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
	#[pallet::call]
	impl<T: Config> Pallet<T> {


		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(2, 1))]
		pub fn create_category(origin: OriginFor<T>, name: Vec<u8>, parent: [u8; 32]) -> DispatchResult {
			let sender = ensure_signed(origin)?;

			// 保证长度
			ensure!(name.len() >= T::CategoryMinLength::get() as usize, Error::<T>::TooShort);
			ensure!(name.len() <= T::CategoryMaxLength::get() as usize, Error::<T>::TooLong);
			let hash = Self::hash_value(name.clone(), parent.clone());
			match Self::get_category(&hash) {
				None => {
					Self::get_category(&parent).ok_or(Error::<T>::CategoryNotExist)?;
					<Categories<T>>::insert(hash, (&sender, false));
					#[cfg(feature = "std")]{
						println!("category: {:?}", &name);
					}
					Self::deposit_event(Event::CategoryCreated{hash: hash, name: name, parent: parent, who: sender, verified: false});
					
					28,229,136,134,231,177,187,49 
					Ok(())
				},
				Some(_old) => {
					Err(Error::<T>::CategoryAlreadyExist)?
				},
			}

		}

		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(2, 1))]
		pub fn create_label(origin: OriginFor<T>, name: Vec<u8>, category: [u8; 32]) -> DispatchResult {
			let sender = ensure_signed(origin)?;

			// 保证长度
			ensure!(name.len() >= T::LabelMinLength::get() as usize, Error::<T>::TooShort);
			ensure!(name.len() <= T::LabelMaxLength::get() as usize, Error::<T>::TooLong);

			let hash = Self::hash_value(name.clone(), category.clone());
			match Self::get_label(&hash) {
				None => {
					// 检查分类是否存在，如果不存在则报错
					Self::get_category(&category).ok_or(Error::<T>::CategoryNotExist)?;
					<Labels<T>>::insert(hash, (&sender, false));
					Self::deposit_event(Event::LabelCreated{hash: hash, name: name, category: category, who: sender, verified: false});
					Ok(())
				},
				Some(_old) => {
					Err(Error::<T>::LabelAlreadyExist)?
				},
			}
		}

		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(2, 1))]
		pub fn create_subject(origin: OriginFor<T>, name: Vec<u8>, category: [u8; 32]) -> DispatchResult {
			let sender = ensure_signed(origin)?;

			// 保证长度
			ensure!(name.len() >= T::SubjectMinLength::get() as usize, Error::<T>::TooShort);
			ensure!(name.len() <= T::SubjectMaxLength::get() as usize, Error::<T>::TooLong);

			let hash = Self::hash_value(name.clone(), category.clone());
			match Self::get_subject(&hash) {
				None => {
					// 检查分类是否存在，如果不存在则报错
					Self::get_category(&category).ok_or(Error::<T>::CategoryNotExist)?;
					<Subjects<T>>::insert(hash, (&sender, false));
					Self::deposit_event(Event::SubjectCreated{hash: hash, name: name, category: category, who: sender, verified: false});
					Ok(())
				},
				Some(_old) => {
					Err(Error::<T>::SubjectAlreadyExist)?
				},
			}
		}

		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(2, 1))]
		pub fn create_dimension(origin: OriginFor<T>, name: Vec<u8>, subject: [u8; 32]) -> DispatchResult {
			let sender = ensure_signed(origin)?;

			// 保证长度
			ensure!(name.len() >= T::DimensionMinLength::get() as usize, Error::<T>::TooShort);
			ensure!(name.len() <= T::DimensionMaxLength::get() as usize, Error::<T>::TooLong);

			let hash = Self::hash_value(name.clone(), subject.clone());
			match Self::get_dimension(&hash) {
				None => {
					// 检查subject是否存在，如果不存在则报错
					Self::get_subject(&subject).ok_or(Error::<T>::SubjectNotExist)?;
					<Dimensions<T>>::insert(hash, (&sender, false));
					Self::deposit_event(Event::DimensionCreated{hash: hash, name: name, subject: subject, who: sender, verified: false});
					Ok(())
				},
				Some(_old) => {
					Err(Error::<T>::DimensionAlreadyExist)?
				},
			}
		}

		#[pallet::weight(10_000 + T::DbWeight::get().writes(1))]
		pub fn create_content(origin: OriginFor<T>, category: [u8; 32], label: [u8; 32], subject: [u8; 32], dimension: [u8; 32], content: Vec<u8>) -> DispatchResult {
			let sender = ensure_signed(origin)?;

			ensure!(content.len() >= T::ContentMinLength::get() as usize, Error::<T>::TooShort);
			ensure!(content.len() <= T::ContentMaxLength::get() as usize, Error::<T>::TooLong);

			let payload = (
				&category,
				&label,
				&subject,
				&dimension,
				&content,
			);
			let hash = payload.using_encoded(keccak_256);
			match Self::get_content(&hash) {
				None => {
					// 检查分类是否存在，如果不存在则报错
					Self::get_category(&category).ok_or(Error::<T>::CategoryNotExist)?;
					Self::get_label(&label).ok_or(Error::<T>::LabelNotExist)?;
					Self::get_subject(&subject).ok_or(Error::<T>::SubjectNotExist)?;
					Self::get_dimension(&dimension).ok_or(Error::<T>::DimensionNotExist)?;
					<Contents<T>>::insert(hash, (&sender, false));
					Self::deposit_event(Event::ContentCreated {
						hash: hash, category: category, label: label, subject: subject, dimension: dimension, content: content, who: sender, verified: false
					});
					Ok(())
				},
				Some(_old) => {
					Err(Error::<T>::DimensionAlreadyExist)?
				},
			}
		}

	}

	impl<T: Config> Pallet<T>{
		fn hash_value(name: Vec<u8>, hash:[u8; 32]) -> [u8;32]{
			let payload = (
				name,
				hash,
			);
			payload.using_encoded(keccak_256)
		}
	}


	// Test Genesis Configuration
	#[pallet::genesis_config]
	pub struct GenesisConfig<T: Config> {
		pub root_category: [u8; 32],
		pub root_account: T::AccountId,
	}

	#[cfg(feature = "std")]
	impl<T: Config> Default for GenesisConfig<T> {
		fn default() -> Self {
			Self {
				root_category: Default::default(),
				root_account: Default::default(),
			}
		}
	}

	#[pallet::genesis_build]
	impl<T: Config> GenesisBuild<T> for GenesisConfig<T> {
		fn build(&self) {
			<Categories<T>>::insert(&self.root_category, (&self.root_account, true));
		}
	}
}

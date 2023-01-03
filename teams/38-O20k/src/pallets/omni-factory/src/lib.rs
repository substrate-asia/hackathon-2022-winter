#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[frame_support::pallet]
pub mod pallet {
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;
	use sp_std::vec::Vec;
	use codec::{Encode, Decode};
	use omniverse_protocol_traits::{VerifyResult, VerifyError, OmniverseAccounts, OmniverseTokenProtocol,
		TRANSFER, MINT, TransferTokenOp, MintTokenOp, TokenOpcode};
	use omniverse_token_traits::{OmniverseTokenFactoryHandler, FactoryResult, FactoryError};

    /// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		type OmniverseProtocol: OmniverseAccounts;
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
	#[pallet::getter(fn tokens_info)]
	// Learn more about declaring storage items:
	// https://docs.substrate.io/v3/runtime/storage#declaring-storage-items
	pub type TokensInfo<T:Config> = StorageMap<_, Blake2_128Concat, Vec<u8>, OmniverseToken<T::AccountId>>;

	#[pallet::storage]
	#[pallet::getter(fn tokens)]
	// Learn more about declaring storage items:
	// https://docs.substrate.io/v3/runtime/storage#declaring-storage-items
	pub type Tokens<T:Config> = StorageDoubleMap<_, Blake2_128Concat, Vec<u8>, Blake2_128Concat, [u8; 64], u128, ValueQuery, GetDefaultValue>;

    // Pallets use events to inform users when important changes are made.
	// https://docs.substrate.io/v3/runtime/events-and-errors
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Event documentation should end with an array that provides descriptive names for event
		/// parameters. [something, who]
		TokenCreated(T::AccountId, Vec<u8>),
		TransactionSent(Vec<u8>, [u8; 64]),
		MembersSet(Vec<u8>, Vec::<u8>),
	}

    // Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		/// Error names should be descriptive.
		TokenAlreadyExist,
		/// Errors should have helpful documentation associated with them.
		TokenNotExist,
		NotOwner,
	}

    #[pallet::hooks]
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}

    // Dispatchable functions allows users to interact with the pallet and invoke state changes.
	// These functions materialize as "extrinsics", which are often compared to transactions.
	// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// An example dispatchable that takes a singles value as a parameter, writes the value to
		/// storage and emits an event. This function must be dispatched by a signed extrinsic.
		#[pallet::weight(0)]
		pub fn create_token(origin: OriginFor<T>, owner_pk: [u8; 64], token_id: Vec<u8>, members: Option<Vec<u8>>) -> DispatchResult {
			let sender = ensure_signed(origin)?;

			// Check if the token exists
			ensure!(!TokensInfo::<T>::contains_key(&token_id), Error::<T>::TokenAlreadyExist);

			// Update storage.
			TokensInfo::<T>::insert(
                &token_id,
                OmniverseToken::new(sender.clone(), owner_pk, token_id.clone(), members)
            );

			// Emit an event.
			Self::deposit_event(Event::TokenCreated(sender, token_id));
			// Return a successful DispatchResultWithPostInfo
			Ok(())
		}

		#[pallet::weight(0)]
		pub fn send_transaction(origin: OriginFor<T>, token_id: Vec<u8>, data: OmniverseTokenProtocol) -> DispatchResult {
			ensure_signed(origin)?;

			Self::send_transaction_external(token_id, &data).map_err(|_| Error::<T>::TokenNotExist)?;

			Ok(())
		}

		#[pallet::weight(0)]
		pub fn set_members(origin: OriginFor<T>, token_id: Vec<u8>, members: Vec<u8>) -> DispatchResult {
			let sender = ensure_signed(origin)?;

            // Check if the token exists.
            let mut token = TokensInfo::<T>::get(&token_id).ok_or(Error::<T>::TokenNotExist)?;

            ensure!(token.owner == sender, Error::<T>::NotOwner);

			token.add_members(members.clone());

            // Update storage
			TokensInfo::<T>::insert(&token_id, token);

            Self::deposit_event(Event::MembersSet(token_id, members));

			Ok(())
		}
	}

	impl<T: Config> OmniverseTokenFactoryHandler for Pallet<T> {
		fn send_transaction_external(token_id: Vec<u8>, data: &OmniverseTokenProtocol) -> Result<FactoryResult, FactoryError> {
			// Check if the token exists.
            let mut token = TokensInfo::<T>::get(&token_id).ok_or(FactoryError::TokenNotExist)?;

            token.handle_transaction::<T>(&data)?;

            Self::deposit_event(Event::TransactionSent(token_id, data.from));

			Ok(FactoryResult::Success)
		}
	}

	#[derive(Clone, PartialEq, Eq, Debug, Encode, Decode, TypeInfo)]
	pub struct OmniverseToken<AccountId> {
		owner: AccountId,
		owner_pk: [u8; 64],
		token_id: Vec<u8>,
		pub members: Vec<u8>
	}

	impl<AccountId> OmniverseToken<AccountId> {		
		fn new(owner: AccountId, owner_pk: [u8; 64], token_id: Vec<u8>, members: Option<Vec<u8>>) -> Self {
			Self {
				owner,
				owner_pk,
				token_id,
				members: members.unwrap_or(Vec::<u8>::new())
			}
		}
		
		fn handle_transaction<T: Config>(&mut self, data: &OmniverseTokenProtocol) -> Result<FactoryResult, FactoryError> {
			// Check if the tx destination is correct
			if data.to != self.token_id {
				return Err(FactoryError::WrongDestination);
			}
	
			// Check if the sender is honest
			if T::OmniverseProtocol::is_malicious(data.from) {
				return Err(FactoryError::UserIsMalicious);
			}
	
			// Verify the signature
			let ret = T::OmniverseProtocol::verify_transaction(&data);
			match ret {
				Ok(VerifyResult::Malicious) => return Ok(FactoryResult::ProtocolMalicious),
				Ok(VerifyResult::Duplicated) => return Ok(FactoryResult::ProtocolDuplicated),
				Err(VerifyError::SignatureError) => return Err(FactoryError::ProtocolSignatureError),
				Err(VerifyError::SignerNotCaller) => return Err(FactoryError::ProtocolSignerNotCaller),
				Err(VerifyError::NonceError) => return Err(FactoryError::ProtocolNonceError),
				_ => (),
			}
	
			// Execute
			let op_data = TokenOpcode::decode(&mut data.data.as_slice()).unwrap();
			if op_data.op == TRANSFER {
				let transfer_data = TransferTokenOp::decode(&mut op_data.data.as_slice()).unwrap();
				self.omniverse_transfer::<T>(data.from, transfer_data.to, transfer_data.amount)?;
			}
			else if op_data.op == MINT {
				let mint_data = MintTokenOp::decode(&mut op_data.data.as_slice()).unwrap();
				if data.from != self.owner_pk {
					return Err(FactoryError::SignerNotOwner);
				}
				self.omniverse_mint::<T>(mint_data.to, mint_data.amount);
			}

			Ok(FactoryResult::Success)
		}
	
		fn omniverse_transfer<T: Config>(&mut self, from: [u8; 64], to: [u8; 64], amount: u128) -> Result<(), FactoryError> {
			let from_balance = Tokens::<T>::get(&self.token_id, &from);
			if from_balance < amount {
				return Err(FactoryError::BalanceOverflow);
			}
			else {
				Tokens::<T>::insert(&self.token_id, &from, from_balance - amount);
				let to_balance = Tokens::<T>::get(&self.token_id, &to);
				Tokens::<T>::insert(&self.token_id, &to, to_balance + amount);
			}
			Ok(())
		}
	
		fn omniverse_mint<T: Config>(&mut self, to: [u8; 64], amount: u128) {
			let balance = Tokens::<T>::get(&self.token_id, &to);
			Tokens::<T>::insert(&self.token_id, &to, balance + amount);
		}
	
		fn add_members(&mut self, members: Vec<u8>) {
			for m in &members {
				if !self.members.contains(m) {
					self.members.push(*m)
				}
			}
		}
	}
}
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

use codec::{Decode, Encode, MaxEncodedLen};
use frame_support::{
	traits::{
		ConstU32, EstimateNextSessionRotation, FindAuthor, OneSessionHandler,
		ValidatorSetWithIdentification,
	},
	BoundedSlice, BoundedVec, WeakBoundedVec,
};
use frame_system::offchain::CreateSignedTransaction;
use scale_info::TypeInfo;
use serde::{Deserialize, Deserializer, Serialize};
use sp_core::crypto::KeyTypeId;
use sp_runtime::{
	offchain::{
		http,
		storage::{StorageRetrievalError, StorageValueRef},
		storage_lock::{BlockAndTime, StorageLock},
		Duration,
	},
	traits::BlockNumberProvider,
	RuntimeAppPublic, RuntimeDebug,
};
use sp_std::{
	cmp::{Eq, PartialEq},
	collections::btree_set::BTreeSet,
	prelude::*,
	str,
};

pub const MAIL_SUFFIX: &str = "@pmailbox.org";
pub const KEY_TYPE: KeyTypeId = KeyTypeId(*b"mail");
const FETCH_TIMEOUT_PERIOD: u64 = 3000; // in milli-seconds
const LOCK_TIMEOUT_EXPIRATION: u64 = FETCH_TIMEOUT_PERIOD + 1000; // in milli-seconds
const LOCK_BLOCK_EXPIRATION: u32 = 3; // in block number

enum OffchainErr {
	UnexpectedError,
	Ineligible,
	Working,
}

impl sp_std::fmt::Debug for OffchainErr {
	fn fmt(&self, fmt: &mut sp_std::fmt::Formatter) -> sp_std::fmt::Result {
		match *self {
			OffchainErr::UnexpectedError => write!(fmt, "Should not appear, Unexpected error."),
			OffchainErr::Ineligible => write!(fmt, "The current node does not have the qualification to execute offline working machines"),
			OffchainErr::Working => write!(fmt, "The offline working machine is currently executing work"),
		}
	}
}

#[derive(Encode, Decode, Eq, PartialEq, Clone, RuntimeDebug, TypeInfo, MaxEncodedLen)]
pub struct Mail {
	timestamp: u64,
	store_hash: BoundedVec<u8, ConstU32<128>>,
}

#[derive(Encode, Decode, Eq, PartialEq, Clone, RuntimeDebug, TypeInfo, MaxEncodedLen)]
pub enum MailAddress<AccountId> {
	SubAddr(AccountId),                          // substrate address, start with 5...
	ETHAddr(BoundedVec<u8, ConstU32<128>>),      // ethereum address, start with 0...
	MoonbeamAddr(BoundedVec<u8, ConstU32<128>>), // moonbeam address, start with 0...
	NormalAddr(BoundedVec<u8, ConstU32<128>>),   /* normal address, such as gmail,
	                                              * outlook.com...
	                                              * //1@q.cn */
}

#[frame_support::pallet]
pub mod pallet {
	use super::*;

	use base58::ToBase58;
	use codec::{
		alloc::string::{String, ToString},
		Encode,
	};
	use frame_support::pallet_prelude::*;
	use frame_system::{offchain::SubmitTransaction, pallet_prelude::*};
	use sha2::{Digest, Sha256};
	use sp_std::{borrow::ToOwned, vec::Vec};

	pub const LIMIT: u64 = u64::MAX;

	pub mod sr25519 {
		pub mod app_sr25519 {
			use crate::*;
			use sp_runtime::app_crypto::{app_crypto, sr25519};
			app_crypto!(sr25519, KEY_TYPE);
		}

		sp_runtime::app_crypto::with_pair! {
			pub type AuthorityPair = app_sr25519::Pair;
		}

		pub type AuthoritySignature = app_sr25519::Signature;

		pub type AuthorityId = app_sr25519::Public;
	}

	/*
	{
	"code": 0,
	"data": [
	  {
			"subject": "test",
			"body": "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=GB18030\"><div>hello, boy. how are you.</div><div><br></div><div><div style=\"color:#909090;font-family:Arial Narrow;font-size:12px\">------------------</div><div style=\"font-size:14px;font-family:Verdana;color:#000;\"><a class=\"xm_write_card\" id=\"in_alias\" style=\"white-space: normal; display: inline-block; text-decoration: none !important;font-family: -apple-system,BlinkMacSystemFont,PingFang SC,Microsoft YaHei;\" href=\"https://wx.mail.qq.com/home/index?t=readmail_businesscard_midpage&amp;nocheck=true&amp;name=%E5%B0%8F%E7%99%BD%E9%BE%99&amp;icon=http%3A%2F%2Fthirdqq.qlogo.cn%2Fg%3Fb%3Dsdk%26k%3Diby9h7f0AjE5pUic9pIt3ynw%26s%3D100%26t%3D1556660321%3Frand%3D1650372662&amp;mail=116174160%40qq.com&amp;code=\" target=\"_blank\"><table style=\"white-space: normal;table-layout: fixed; padding-right: 20px;\" contenteditable=\"false\" cellpadding=\"0\" cellspacing=\"0\"><tbody><tr valign=\"top\"><td style=\"width: 40px;min-width: 40px; padding-top:10px\"><div style=\"width: 38px; height: 38px; border: 1px #FFF solid; border-radius:50%; margin: 0;vertical-align: top;box-shadow: 0 0 10px 0 rgba(127,152,178,0.14);\"><img src=\"http://thirdqq.qlogo.cn/g?b=sdk&amp;k=iby9h7f0AjE5pUic9pIt3ynw&amp;s=100&amp;t=1556660321?rand=1650372662\" style=\"width:100%;height:100%;border-radius:50%;pointer-events: none;\"></div></td><td style=\"padding: 10px 0 8px 10px;\"><div class=\"businessCard_name\" style=\"font-size: 14px;color: #33312E;line-height: 20px; padding-bottom: 2px; margin:0;font-weight: 500;\">小白龙</div><div class=\"businessCard_mail\" style=\"font-size: 12px;color: #999896;line-height: 18px; margin:0;\">116174160@qq.com</div></td></tr></tbody></table></a></div></div><div>&nbsp;</div>",
			"from": [{
				"Name": "=?gb18030?B?0KGw18H6?=",
				"Address": "116174160@qq.com"
			}],
			"to": [{
				"Name": "=?gb18030?B?dGVzdDE=?=",
				"Address": "test1@pmailbox.org"
			}],
			"date": "2022-12-04T17:52:21+08:00",
			"timestampe": 1670147541000
		}
		]
	}
	*/

	#[derive(Serialize, Deserialize, Default, RuntimeDebug)]
	struct AddressInfo {
		#[serde(alias = "name", alias = "Name")]
		name: String,
		#[serde(alias = "address", alias = "Address")]
		address: String,
	}

	#[derive(Serialize, Deserialize, Default, RuntimeDebug)]
	struct MailInfo {
		subject: String,
		body: String,
		from: Vec<AddressInfo>,
		to: Vec<AddressInfo>,
		date: String,

		timestampe: u64,
	}

	#[derive(Deserialize, Default, RuntimeDebug)]
	struct MailListResponse {
		data: Vec<MailInfo>,
		code: u64,
		msg: String,
	}

	// struct TestResponse {
	// 	data:&'static str,
	// }

	/*
	{
	"emailname": "test1@pmailbox.org",
	"from": "test1@pmailbox.org",
	"to": ["admin@pmailbox.org"],
	"cc": [],
	"bcc": [],
	"subject": "this is a title4",
	"mailtype": "text",
	"text": "text body",
	"html": ""
	"store_hash": ""
	}
	*/

	#[derive(Serialize, Deserialize, Default, RuntimeDebug)]
	struct CreateMailInfo {
		emailname: String,
		from: String,
		to: Vec<String>,
		cc: Vec<String>,
		bcc: Vec<String>,
		subject: String,
		mailtype: String,
		text: String,
		html: String,
		hash: String,
	}

	#[derive(Serialize, Deserialize, Default, RuntimeDebug)]
	struct CreateMailWithHashInfo {
		emailname: String,
		from: String,
		to: Vec<String>,
		mailtype: String,
		hash: String,
	}

	#[derive(Deserialize, Default, RuntimeDebug)]
	struct ResponseStruct {
		data: String,
		code: u64,
		msg: String,
	}

	#[derive(Deserialize, Default, RuntimeDebug)]
	struct UploadJsonResponse {
		data: String,
		code: u64,
		msg: String,
	}

	pub fn de_string_to_bytes<'de, D>(de: D) -> Result<Vec<u8>, D::Error>
	where
		D: Deserializer<'de>,
	{
		// let s: &str = Deserialize::deserialize(de)?;
		// Ok(s.as_bytes().to_vec())

		let s = String::deserialize(de)?;
		Ok(s.as_bytes().to_vec())
	}

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	pub struct Pallet<T>(_);

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config + CreateSignedTransaction<Call<Self>> {
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

		/// Find the consensus of the current block
		type FindAuthor: FindAuthor<Self::AccountId>;

		/// Configuration to be used for offchain worker
		type AuthorityId: Member
			+ Parameter
			+ RuntimeAppPublic
			+ Ord
			+ MaybeSerializeDeserialize
			+ MaxEncodedLen;
		/// Verifier of this round
		type ValidatorSet: ValidatorSetWithIdentification<Self::AccountId>;
		/// Information for the next session
		type NextSessionRotation: EstimateNextSessionRotation<Self::BlockNumber>;

		/// A configuration for base priority of unsigned transactions.
		///
		/// This is exposed so that it can be tuned for particular runtime, when
		/// multiple pallets send unsigned transactions.
		#[pallet::constant]
		type UnsignedPriority: Get<TransactionPriority>;

		/// the max offchain worker keys size
		#[pallet::constant]
		type StringLimit: Get<u32> + Clone + Eq + PartialEq;

		/// the offchain worker work time per time.
		#[pallet::constant]
		type LockTime: Get<Self::BlockNumber>;
	}

	///  bind user's redstone network address to other mail address (such ethereum address, moonbeam
	/// address, web2 address ...)
	#[pallet::storage]
	#[pallet::getter(fn contact_list)]
	pub type ContactList<T: Config> = StorageDoubleMap<
		_,
		Twox64Concat,
		T::AccountId,
		Twox64Concat,
		MailAddress<T::AccountId>,
		BoundedVec<u8, ConstU32<128>>,
		OptionQuery,
	>;

	///
	#[pallet::storage]
	#[pallet::getter(fn mailing_list)]
	pub type MailingList<T: Config> = StorageNMap<
		_,
		(
			storage::Key<Blake2_128Concat, MailAddress<T::AccountId>>,
			storage::Key<Blake2_128Concat, MailAddress<T::AccountId>>,
			storage::Key<Blake2_128Concat, u64>,
		),
		BoundedVec<u8, ConstU32<128>>,
	>;

	#[pallet::storage]
	#[pallet::getter(fn map_mail)]
	pub(super) type MailMap<T: Config> =
		StorageMap<_, Twox64Concat, T::AccountId, BoundedVec<u8, ConstU32<128>>>;

	#[pallet::storage]
	#[pallet::getter(fn map_owner)]
	pub(super) type OwnerMap<T: Config> =
		StorageMap<_, Twox64Concat, BoundedVec<u8, ConstU32<128>>, T::AccountId>;

	#[pallet::storage]
	#[pallet::getter(fn cur_authority_index)]
	pub(super) type CurAuthorityIndex<T: Config> = StorageValue<_, u16, ValueQuery>;

	#[pallet::storage]
	#[pallet::getter(fn keys)]
	pub(super) type Keys<T: Config> =
		StorageValue<_, WeakBoundedVec<T::AuthorityId, T::StringLimit>, ValueQuery>;

	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Event documentation should end with an array that provides descriptive names for event
		/// parameters. [something, who]
		AddressBound(T::AccountId, BoundedVec<u8, ConstU32<128>>),

		SendMailSuccess(MailAddress<T::AccountId>, MailAddress<T::AccountId>, Mail),
		UpdateAliasSuccess(T::AccountId, MailAddress<T::AccountId>, BoundedVec<u8, ConstU32<128>>),
		SetAliasSuccess(T::AccountId, MailAddress<T::AccountId>, BoundedVec<u8, ConstU32<128>>),
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		/// Error names should be descriptive.
		AddressBindDuplicate,
		/// Errors should have helpful documentation associated with them.
		MailSendDuplicate,
		AddressMustBeExist,

		HttpFetchingError,
		DeadlineReached,
		StatueCodeError,
		FormatError,
		SerializeToStringError,
		DeserializeToObjError,
		OffchainUnsignedTxError,
	}

	// Dispatchable functions allows users to interact with the pallet and invoke state changes.
	// These functions materialize as "extrinsics", which are often compared to transactions.
	// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// An example dispatchable that takes a singles value as a parameter, writes the value to
		/// storage and emits an event. This function must be dispatched by a signed extrinsic.

		/// A function to bind PMail to current address, the address and email address have a
		/// one-to-one relationship and cannot be bound again
		#[pallet::weight(10_000)]
		pub fn bind_address(
			origin: OriginFor<T>,
			pmail_address: BoundedVec<u8, ConstU32<128>>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			ensure!(!MailMap::<T>::contains_key(&who), Error::<T>::AddressBindDuplicate);
			ensure!(
				!OwnerMap::<T>::contains_key(pmail_address.clone()),
				Error::<T>::AddressBindDuplicate
			);

			MailMap::<T>::insert(&who, pmail_address.clone());
			OwnerMap::<T>::insert(pmail_address.clone(), &who);

			Self::deposit_event(Event::AddressBound(who.clone(), pmail_address.clone()));

			log::info!("-------bind address to pmail success: {:?}", pmail_address.clone());

			Ok(())
		}

		/// A function to set an alias for one's own contacts, and the alias can be modified again
		#[pallet::weight(10_000)]
		pub fn set_alias(
			origin: OriginFor<T>,
			address: MailAddress<T::AccountId>,
			alias: BoundedVec<u8, ConstU32<128>>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			match ContactList::<T>::get(&who, address.clone()) {
				Some(_) => {
					ContactList::<T>::mutate(&who, address.clone(), |v| *v = Some(alias.clone()));
					Self::deposit_event(Event::UpdateAliasSuccess(
						who.clone(),
						address.clone(),
						alias.clone(),
					));
					log::info!("-------update alias success: {:?}", alias.clone());
				},
				None => {
					ContactList::<T>::insert(&who, address.clone(), alias.clone());
					Self::deposit_event(Event::SetAliasSuccess(
						who.clone(),
						address.clone(),
						alias.clone(),
					));
					log::info!("-------add alias success: {:?}", alias.clone());
				},
			}

			Ok(())
		}

		/// A function that sends mail to any type of address
		#[pallet::weight(10_000)]
		pub fn send_mail(
			origin: OriginFor<T>,
			to: MailAddress<T::AccountId>,
			timestamp: u64,
			store_hash: BoundedVec<u8, ConstU32<128>>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			ensure!(MailMap::<T>::contains_key(&who), Error::<T>::AddressMustBeExist);
			let from = MailAddress::SubAddr(who.clone());

			ensure!(
				!MailingList::<T>::contains_key((from.clone(), to.clone(), timestamp)),
				Error::<T>::MailSendDuplicate
			);

			// add mail to mailing list
			MailingList::<T>::insert((from.clone(), to.clone(), timestamp), store_hash.clone());

			let mail = Mail { timestamp, store_hash };

			log::info!("------- mail send success");

			Self::deposit_event(Event::SendMailSuccess(from.clone(), to.clone(), mail));

			Ok(())
		}

		/// A function to upload the mail sent by web2 mailbox to pmail to the chain
		#[pallet::weight(0)]
		pub fn submit_add_mail(
			origin: OriginFor<T>,
			_block_number: T::BlockNumber,
			from: MailAddress<T::AccountId>,
			to: MailAddress<T::AccountId>,
			timestamp: u64,
			store_hash: BoundedVec<u8, ConstU32<128>>,
		) -> DispatchResult {
			// This ensures that the function can only be called via unsigned transaction.
			ensure_none(origin)?;

			MailingList::<T>::insert((from.clone(), to.clone(), timestamp), store_hash.clone());

			let mail = Mail { timestamp, store_hash };
			Self::deposit_event(Event::SendMailSuccess(from, to, mail));

			log::info!("###### in submit_add_mail_with_signed_payload.");

			Ok(())
		}

		/// update authority index
		#[pallet::weight(0)]
		pub fn submit_update_authority_index(
			origin: OriginFor<T>,
			_block_number: T::BlockNumber,
		) -> DispatchResult {
			// This ensures that the function can only be called via unsigned transaction.
			ensure_none(origin)?;

			let max = Keys::<T>::get().len() as u16;
			let mut index = CurAuthorityIndex::<T>::get();
			if index >= max - 1 {
				index = 0;
			} else {
				index = index + 1;
			}
			CurAuthorityIndex::<T>::put(index);

			log::info!("###### in submit_update_authority_index.");

			Ok(())
		}
	}

	/// all notification will be send via offchain_worker, it is more efficient
	#[pallet::hooks]
	impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
		fn offchain_worker(now: T::BlockNumber) {
			log::info!("Hello world from mail-pallet workers!: {:?}", now);
			if sp_io::offchain::is_validator() {
				const SWITCHING_INTERVAL: u32 = 10;
				let modu = now
					.try_into()
					.map_or(SWITCHING_INTERVAL, |bn: usize| (bn as u32) % SWITCHING_INTERVAL);

				if 0 == modu {
					let _ = Self::change_authority_index(now);
				}
				let _ = Self::offchain_work_start(now);
			}
		}
	}

	/// configure unsigned tx, use it to update onchain status of notification, so that
	/// notifications will not send repeatedly
	#[pallet::validate_unsigned]
	impl<T: Config> ValidateUnsigned for Pallet<T> {
		type Call = Call<T>;

		/// Validate unsigned call to this module.
		///
		/// By default unsigned transactions are disallowed, but implementing the validator
		/// here we make sure that some particular calls (the ones produced by offchain worker)
		/// are being whitelisted and marked as valid.
		fn validate_unsigned(_source: TransactionSource, call: &Self::Call) -> TransactionValidity {
			// Firstly let's check that we call the right function.
			let valid_tx = |provide| {
				ValidTransaction::with_tag_prefix("ocw-mail")
					.priority(T::UnsignedPriority::get())
					.and_provides([&provide])
					.longevity(3)
					.propagate(true)
					.build()
			};

			match call {
				Call::submit_add_mail {
					block_number: _,
					from: _,
					to: _,
					timestamp: _,
					store_hash: _,
				} => valid_tx(b"submit_add_mail".to_vec()),
				Call::submit_update_authority_index { block_number: _ } =>
					valid_tx(b"submit_update_authority_index".to_vec()),
				_ => InvalidTransaction::Call.into(),
			}
		}
	}

	/// Synchronize the obtained web2 mailbox information to the chain and send the web3 mailbox to
	/// the connected web2 mailbox
	impl<T: Config> Pallet<T> {
		fn offchain_work_start(now: T::BlockNumber) -> Result<(), OffchainErr> {
			log::info!("get loacl authority...");
			let (authority_id, _validators_index, _validators_len) = Self::get_authority()?;
			log::info!("### get loacl authority success! {:? }", authority_id);
			if !Self::check_working(&now, &authority_id) {
				return Err(OffchainErr::Working)
			}

			log::info!("### begin worker! {:?} {:?}", authority_id, &authority_id.encode());
			//get mail for web2, username is a mail address in the format of pmail
			for (account_id, username) in MailMap::<T>::iter() {
				let strusername =
					match scale_info::prelude::string::String::from_utf8(username.to_vec()) {
						Ok(v) => v,
						Err(e) => {
							log::info!("###### decode username error  {:?}", e);
							continue
						},
					};

				let rt = Self::get_email_from_web2(&strusername);

				match rt {
					Ok(mail_list_web2) =>
						if 0 == mail_list_web2.code {
							log::info!("####0 == mail_list_web2.code");

							for item in mail_list_web2.data {
								let from = MailAddress::NormalAddr(
									item.from[0]
										.address
										.clone()
										.as_bytes()
										.to_vec()
										.try_into()
										.unwrap(),
								);

								let to = MailAddress::SubAddr(account_id.clone());

								let timestamp = item.timestampe;
								if !MailingList::<T>::contains_key((
									from.clone(),
									to.clone(),
									timestamp,
								)) {
									let str_hash = match Self::upload_mail_json(item) {
										Ok(v) => v,
										Err(e) => {
											log::info!("upload_mail_json err: {:?}", e);
											continue
										},
									};
									let hash: BoundedVec<u8, ConstU32<128>> =
										str_hash.as_bytes().to_vec().try_into().unwrap();

									let _ = Self::add_mail(now, from, to, timestamp, hash);
								}
							}
						},
					Err(e) => {
						log::info!("####get_email_from_web2 error {:?}", e);
					},
				}
			}

			//send mail to web2, username is a mail address in the format of any web2 mail
			// address,such as gmail, outlook and so on
			let store_map_mailhash = StorageValueRef::persistent(b"difttt_ocw::map_mailhash");
			let mut map_mailhash: BTreeSet<BoundedVec<u8, ConstU32<128>>>;
			if let Ok(Some(info)) =
				store_map_mailhash.get::<BTreeSet<BoundedVec<u8, ConstU32<128>>>>()
			{
				map_mailhash = info;
			} else {
				map_mailhash = BTreeSet::new();
			}
			let mut lock = StorageLock::<BlockAndTime<Self>>::with_block_and_time_deadline(
				b"offchain-demo::lock",
				LOCK_BLOCK_EXPIRATION,
				Duration::from_millis(LOCK_TIMEOUT_EXPIRATION),
			);
			if let Ok(_guard) = lock.try_lock() {
				for (k, v) in MailingList::<T>::iter() {
					let from = k.0;
					let to = k.1;

					match from {
						MailAddress::SubAddr(from) => match to {
							//todo SubAddr is 5
							MailAddress::NormalAddr(to_address) =>
								if !map_mailhash.contains(&v) {
									if !MailMap::<T>::contains_key(&from) {
										continue
									}

									let from_username = MailMap::<T>::get(&from).unwrap();

									let str_from_username =
										match scale_info::prelude::string::String::from_utf8(
											from_username.to_vec(),
										) {
											Ok(v) => v,
											Err(e) => {
												log::info!(
													"###### decode from_username error  {:?}",
													e
												);
												continue
											},
										};

									let str_to_address =
										match scale_info::prelude::string::String::from_utf8(
											to_address.to_vec(),
										) {
											Ok(v) => v,
											Err(e) => {
												log::info!(
													"###### decode to_address error  {:?}",
													e
												);
												continue
											},
										};

									let str_hash =
										match scale_info::prelude::string::String::from_utf8(
											v.to_vec(),
										) {
											Ok(v) => v,
											Err(e) => {
												log::info!(
													"###### decode to_address error  {:?}",
													e
												);
												continue
											},
										};

									let rt = Self::send_mail_to_web2(
										&str_from_username,
										&str_to_address,
										&str_hash,
									);
									match rt {
										Ok(_code) => {
											map_mailhash.insert(v);
										},
										Err(e) => {
											log::info!("####send_mail_to_web2 error {:?}", e);
										},
									}
								},
							_ => {},
						},
						_ => {},
					}
				}
				store_map_mailhash.set(&map_mailhash);
			}

			Ok(())
		}

		/// get mail content from web2 mailboxes
		fn get_email_from_web2(username: &str) -> Result<MailListResponse, Error<T>> {
			let deadline = sp_io::offchain::timestamp().add(Duration::from_millis(10_000));

			let url = "http://143.198.218.138:8888/api/mails/list?emailname=".to_owned() +
				username + MAIL_SUFFIX;
			// let url = "http://mail1.pmailbox.org:8888/api/mails/list?emailname=".to_owned() +
			// 	username + MAIL_SUFFIX;

			let request = http::Request::get(&url).add_header("content-type", "application/json");

			let pending = request.deadline(deadline).send().map_err(|e| {
				log::info!("####post pending error: {:?}", e);
				<Error<T>>::HttpFetchingError
			})?;

			let response = pending
				.try_wait(deadline)
				.map_err(|e| {
					log::info!("####get_email_from_web2 get response error 1: {:?}", e);
					<Error<T>>::DeadlineReached
				})?
				.map_err(|e| {
					log::info!("####get_email_from_web2 get response error 2: {:?}", e);
					<Error<T>>::DeadlineReached
				})?;

			if response.code != 200 {
				log::info!("####get_email_from_web2 Unexpected status code: {}", response.code);
				return Err(<Error<T>>::StatueCodeError)
			}

			let body = response.body().collect::<Vec<u8>>();

			// Create a str slice from the body.
			let body_str = sp_std::str::from_utf8(&body).map_err(|_| {
				log::info!("######get_email_from_web2 No UTF8 body");
				<Error<T>>::FormatError
			})?;

			let mail_list_response: MailListResponse =
				serde_json::from_str(&body_str).map_err(|e| {
					log::info!(
						"##### get_email_from_web2Deserialize error: {:?}  {:?}",
						e,
						&body_str
					);
					<Error<T>>::DeserializeToObjError
				})?;

			Ok(mail_list_response)
		}

		fn upload_mail_json(mail_info: MailInfo) -> Result<String, Error<T>> {
			let deadline = sp_io::offchain::timestamp().add(Duration::from_millis(10_000));

			let buff = match serde_json::to_string(&mail_info) {
				Ok(v) => v,
				Err(e) => {
					log::info!("upload_mail_json serde_json::to_string err: {}", e);
					return Err(<Error<T>>::SerializeToStringError)
				},
			};

			let mut hasher = Sha256::new();
			hasher.update(buff.clone());
			let sig = hasher.finalize();
			let base58_sig = &sig[..].to_base58();
			let timestamp_now = sp_io::offchain::timestamp();

			let url = "http://143.198.218.138:8887/api/storage/".to_owned() +
				&base58_sig + &(timestamp_now.unix_millis().to_string());
			// let url = "http://mail1.pmailbox.org:8888/api/mails/create_with_hash";

			let body = vec![buff.as_bytes()];

			let request = http::Request::post(&url, body).deadline(deadline);

			let pending = request.send().map_err(|e| {
				log::info!("####upload_mail_json post pending error: {:?}", e);
				<Error<T>>::HttpFetchingError
			})?;

			let response = pending
				.try_wait(deadline)
				.map_err(|e| {
					log::info!("####upload_mail_json post response error 1: {:?}", e);
					<Error<T>>::DeadlineReached
				})?
				.map_err(|e| {
					log::info!("####upload_mail_json post response error 2: {:?}", e);
					<Error<T>>::DeadlineReached
				})?;

			if response.code != 200 {
				log::info!(
					"####upload_mail_json Unexpected status code: {}  {:?}",
					response.code,
					response
				);
				return Err(<Error<T>>::StatueCodeError)
			}

			let respone_body = response.body().collect::<Vec<u8>>();

			// Create a str slice from the body.
			let respone_body_str = sp_std::str::from_utf8(&respone_body).map_err(|_| {
				log::info!("####upload_mail_json No UTF8 body");
				<Error<T>>::FormatError
			})?;

			let upload_json_response: UploadJsonResponse = serde_json::from_str(&respone_body_str)
				.map_err(|e| {
					log::info!(
						"####upload_mail_json Deserialize error 1: {:?}  {:?} , url is: {:?}",
						e,
						&respone_body_str,
						&url
					);
					log::info!(
						"####upload_mail_json Deserialize error 2 :  the buff is {:?}",
						&buff
					);
					<Error<T>>::DeserializeToObjError
				})?;

			if upload_json_response.code != 0 {
				log::info!(
					"####upload_mail_json Unexpected api status code: {:?}  {:?}",
					upload_json_response.code,
					upload_json_response.msg
				);
				return Err(<Error<T>>::StatueCodeError)
			}

			Ok(upload_json_response.data)
		}

		/// send email to web2 mailboxes
		fn send_mail_to_web2(username: &str, to: &str, hash: &str) -> Result<u64, Error<T>> {
			let deadline = sp_io::offchain::timestamp().add(Duration::from_millis(20_000));

			// let url = "http://127.0.0.1:8888/api/mails/create_with_hash";
			let url = "http://143.198.218.138:8888/api/mails/create_with_hash";
			// let url = "http://mail1.pmailbox.org:8888/api/mails/create_with_hash";

			let full_emal_address = username.to_owned() + MAIL_SUFFIX;
			let mut to_list = Vec::<String>::new();
			to_list.push(String::from(to));

			let mailtype = "txt";

			let create_mail_info = CreateMailWithHashInfo {
				emailname: String::from(full_emal_address.clone()),
				from: String::from(full_emal_address),
				to: to_list,
				mailtype: String::from(mailtype),
				hash: String::from(hash),
			};

			let buff = match serde_json::to_string(&create_mail_info) {
				Ok(v) => v,
				Err(e) => {
					log::info!("####send_mail_to_web2 serde_json::to_string err: {}", e);
					return Err(<Error<T>>::SerializeToStringError)
				},
			};
			let body = vec![buff.as_bytes()];

			let request = http::Request::post(&url, body).deadline(deadline);

			let pending = request.send().map_err(|e| {
				log::info!("####send_mail_to_web2 post pending error: {:?}", e);
				<Error<T>>::HttpFetchingError
			})?;

			let response = pending
				.try_wait(deadline)
				.map_err(|e| {
					log::info!("####send_mail_to_web2 post response error 1: {:?}", e);
					<Error<T>>::DeadlineReached
				})?
				.map_err(|e| {
					log::info!("####send_mail_to_web2 post response error 2: {:?}", e);
					<Error<T>>::DeadlineReached
				})?;

			if response.code != 200 {
				log::info!("####send_mail_to_web2 Unexpected status code: {}", response.code);
				return Err(<Error<T>>::StatueCodeError)
			}

			let body = response.body().collect::<Vec<u8>>();

			// Create a str slice from the body.
			let body_str = sp_std::str::from_utf8(&body).map_err(|_| {
				log::info!("------No UTF8 body");
				<Error<T>>::FormatError
			})?;

			let create_mail_response: ResponseStruct =
				serde_json::from_str(&body_str).map_err(|e| {
					log::info!("------Deserialize error: {:?}", e);
					<Error<T>>::DeserializeToObjError
				})?;

			if create_mail_response.code != 0 {
				log::info!(
					"####send_mail_to_web2 Unexpected api status code: {:?}  {:?}",
					create_mail_response.code,
					create_mail_response.msg
				);
				return Err(<Error<T>>::StatueCodeError)
			}

			log::info!("------Web2 mail send successfully");

			Ok(0)
		}

		/// Integrate the mail of web2 mailbox into pmail network
		fn add_mail(
			block_number: T::BlockNumber,
			from: MailAddress<T::AccountId>,
			to: MailAddress<T::AccountId>,
			timestamp: u64,
			store_hash: BoundedVec<u8, ConstU32<128>>,
		) -> Result<u64, Error<T>> {
			let call = Call::submit_add_mail {
				block_number,
				from: from.clone(),
				to: to.clone(),
				timestamp,
				store_hash: store_hash.clone(),
			};

			let _ = SubmitTransaction::<T, Call<T>>::submit_unsigned_transaction(call.into())
				.map_err(|e| {
					log::error!("Failed in offchain_unsigned_tx add_mail {:?}", e);
					<Error<T>>::OffchainUnsignedTxError
				});

			Ok(0)
		}

		/// Integrate the mail of web2 mailbox into pmail network
		fn change_authority_index(block_number: T::BlockNumber) -> Result<u64, Error<T>> {
			let call = Call::submit_update_authority_index { block_number };

			let _ = SubmitTransaction::<T, Call<T>>::submit_unsigned_transaction(call.into())
				.map_err(|e| {
					log::error!("Failed in offchain_unsigned_tx add_mail {:?}", e);
					<Error<T>>::OffchainUnsignedTxError
				});

			Ok(0)
		}

		// check authority is working
		fn check_working(now: &T::BlockNumber, authority_id: &T::AuthorityId) -> bool {
			let key = &authority_id.encode();
			let storage = StorageValueRef::persistent(key);

			let res =
				storage.mutate(|status: Result<Option<T::BlockNumber>, StorageRetrievalError>| {
					match status {
						// we are still waiting for inclusion.
						Ok(Some(last_block)) => {
							let lock_time = T::LockTime::get();
							if last_block + lock_time > *now {
								log::info!(
									"### we are still waiting for inclusion last_block: {:?}, lock_time: {:?}, now: {:?}",
									last_block,
									lock_time,
									now
								);
								Err(OffchainErr::Working)
							} else {
								log::info!("### no last_block in authority_id store");
								Ok(*now)
							}
						},
						// attempt to set new status
						_ => Ok(*now),
					}
				});

			if res.is_err() {
				log::error!("offchain work: {:?}", OffchainErr::Working);
				return false
			}

			true
		}

		/// get authority
		fn get_authority() -> Result<(T::AuthorityId, u16, usize), OffchainErr> {
			let cur_index = <CurAuthorityIndex<T>>::get();
			let validators = Keys::<T>::get();
			log::info!("####cur_index {:?} validators {:?}", cur_index, validators);
			//this round key to submit transationss
			let epicycle_key = match validators.get(cur_index as usize) {
				Some(id) => id,
				None => return Err(OffchainErr::UnexpectedError),
			};

			let mut local_keys = T::AuthorityId::all();

			if local_keys.len() == 0 {
				log::info!("no local_keys");
				return Err(OffchainErr::Ineligible)
			}

			local_keys.sort();

			let res = local_keys.binary_search(&epicycle_key);

			let authority_id = match res {
				Ok(index) => local_keys.get(index),
				Err(_e) => return Err(OffchainErr::Ineligible),
			};

			let authority_id = match authority_id {
				Some(id) => id,
				None => return Err(OffchainErr::Ineligible),
			};

			Ok((authority_id.clone(), cur_index, validators.len()))
		}

		/// init offchain worker key
		pub fn initialize_keys(keys: &[T::AuthorityId]) {
			if !keys.is_empty() {
				assert!(Keys::<T>::get().is_empty(), "Keys are already initialized!");
				let bounded_keys = <BoundedSlice<'_, _, T::StringLimit>>::try_from(keys)
					.expect("More than the maximum number of keys provided");
				Keys::<T>::put(bounded_keys);
			}
		}
	}

	impl<T: Config> BlockNumberProvider for Pallet<T> {
		type BlockNumber = T::BlockNumber;

		fn current_block_number() -> Self::BlockNumber {
			<frame_system::Pallet<T>>::block_number()
		}
	}
}

impl<T: Config> sp_runtime::BoundToRuntimeAppPublic for Pallet<T> {
	type Public = T::AuthorityId;
}

impl<T: Config> OneSessionHandler<T::AccountId> for Pallet<T> {
	type Key = T::AuthorityId;

	fn on_genesis_session<'a, I: 'a>(validators: I)
	where
		I: Iterator<Item = (&'a T::AccountId, T::AuthorityId)>,
	{
		let keys = validators.map(|x| x.1).collect::<Vec<_>>();
		Self::initialize_keys(&keys);
	}

	fn on_new_session<'a, I: 'a>(_changed: bool, validators: I, _queued_validators: I)
	where
		I: Iterator<Item = (&'a T::AccountId, T::AuthorityId)>,
	{
		// Tell the offchain worker to start making the next session's heartbeats.
		// Since we consider producing blocks as being online,
		// the heartbeat is deferred a bit to prevent spamming.

		// Remember who the authorities are for the new session.
		let keys = validators.map(|x| x.1).collect::<Vec<_>>();
		let bounded_keys = WeakBoundedVec::<_, T::StringLimit>::force_from(
			keys,
			Some(
				"Warning: The session has more keys than expected. \
					A runtime configuration adjustment may be needed.",
			),
		);
		Keys::<T>::put(bounded_keys);
	}

	fn on_before_session_ending() {
		// ignore
	}

	fn on_disabled(_i: u32) {
		// ignore
	}
}

use crate as pallet_omniverse_factory;
use frame_support::parameter_types;
use frame_system as system;
use sp_core::H256;
use sp_runtime::{
	testing::Header,
	traits::{BlakeTwo256, IdentityLookup},
};
use omniverse_protocol_traits::{OmniverseAccounts, OmniverseTokenProtocol, VerifyResult, VerifyError};

type UncheckedExtrinsic = frame_system::mocking::MockUncheckedExtrinsic<Test>;
type Block = frame_system::mocking::MockBlock<Test>;

// Configure a mock runtime to test the pallet.
frame_support::construct_runtime!(
	pub enum Test where
		Block = Block,
		NodeBlock = Block,
		UncheckedExtrinsic = UncheckedExtrinsic,
	{
		System: frame_system::{Pallet, Call, Config, Storage, Event<T>},
		OmniverseFactory: pallet_omniverse_factory::{Pallet, Call, Storage, Event<T>},
	}
);

parameter_types! {
	pub const BlockHashCount: u64 = 250;
	pub const SS58Prefix: u8 = 42;
}

impl system::Config for Test {
	type BaseCallFilter = frame_support::traits::Everything;
	type BlockWeights = ();
	type BlockLength = ();
	type DbWeight = ();
	type RuntimeOrigin = RuntimeOrigin;
	type RuntimeCall = RuntimeCall;
	type Index = u64;
	type BlockNumber = u64;
	type Hash = H256;
	type Hashing = BlakeTwo256;
	type AccountId = u64;
	type Lookup = IdentityLookup<Self::AccountId>;
	type Header = Header;
	type RuntimeEvent = RuntimeEvent;
	type BlockHashCount = BlockHashCount;
	type Version = ();
	type PalletInfo = PalletInfo;
	type AccountData = ();
	type OnNewAccount = ();
	type OnKilledAccount = ();
	type SystemWeightInfo = ();
	type SS58Prefix = SS58Prefix;
	type OnSetCode = ();
	type MaxConsumers = frame_support::traits::ConstU32<16>;
}

#[derive(Default)]
pub struct OmniverseProtocol();

impl OmniverseAccounts for OmniverseProtocol {
	fn verify_transaction(data: &OmniverseTokenProtocol) -> Result<VerifyResult, VerifyError> {
		if data.signature == [0; 65] {
			return Err(VerifyError::SignatureError);
		}

		Ok(VerifyResult::Success)
	}

    fn get_transaction_count(pk: [u8; 64]) -> u128 {
		0
	}

    fn is_malicious(pk: [u8; 64]) -> bool {
		false
	}

    fn get_chain_id() -> u8 {
		1
	}
}

impl pallet_omniverse_factory::Config for Test {
	type RuntimeEvent = RuntimeEvent;
	type OmniverseProtocol = OmniverseProtocol;
}

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
	system::GenesisConfig::default().build_storage::<Test>().unwrap().into()
}

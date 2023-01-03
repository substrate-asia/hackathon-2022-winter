use frame_support::parameter_types;
use frame_system as system;
use sp_core::H256;
use sp_runtime::{
	testing::Header,
	traits::{BlakeTwo256, IdentityLookup},
    BuildStorage
};

use crate as pallet_cicada;

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
		CicadaModule: pallet_cicada::{Pallet, Call, Storage, Config<T>, Event<T>},
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
	type Origin = Origin;
	type Call = Call;
	type Index = u64;
	type BlockNumber = u64;
	type Hash = H256;
	type Hashing = BlakeTwo256;
	type AccountId = u64;
	type Lookup = IdentityLookup<Self::AccountId>;
	type Header = Header;
	type Event = Event;
	type BlockHashCount = BlockHashCount;
	type Version = ();
	type PalletInfo = PalletInfo;
	type AccountData = ();
	type OnNewAccount = ();
	type OnKilledAccount = ();
	type SystemWeightInfo = ();
	type SS58Prefix = SS58Prefix;
	type OnSetCode = ();
}


parameter_types! {
	pub const CategoryMinLength: u32 = 2;
	pub const CategoryMaxLength: u32 = 3;
	pub const LabelMinLength: u32 = 2;
	pub const LabelMaxLength: u32 = 3;
	pub const SubjectMinLength: u32 = 2;
	pub const SubjectMaxLength: u32 = 3;
	pub const DimensionMinLength: u32 = 2;
	pub const DimensionMaxLength: u32 = 3;
	pub const ContentMinLength: u32 = 2;
	pub const ContentMaxLength: u32 = 3;
}


impl pallet_cicada::Config for Test {
	type Event = Event;

	type CategoryMinLength = CategoryMinLength;
	type CategoryMaxLength = CategoryMaxLength;
	type LabelMinLength = LabelMinLength;
	type LabelMaxLength = LabelMaxLength;

	type SubjectMinLength = SubjectMinLength;
	type SubjectMaxLength = SubjectMaxLength;
	type DimensionMinLength = DimensionMinLength;
	type DimensionMaxLength = DimensionMaxLength;

	type ContentMinLength = ContentMinLength;
	type ContentMaxLength = ContentMaxLength;     
}

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
	let t = GenesisConfig {
        system: Default::default(),
        cicada_module: pallet_cicada::GenesisConfig  {
            root_category: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],
            root_account: 0u64
        },
	}
	.build_storage()
	.unwrap();
	t.into()    
}
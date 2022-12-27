use ink_prelude::vec::Vec;
use scale::{Decode, Encode};
use xcm::latest::{
    AssetId,
    MultiAsset,
    MultiLocation,
    Junction,
    Junctions,
    NetworkId,
};

#[derive(Clone, Debug, PartialEq, Eq, Encode, Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub struct UnsignedExtrinsic<Call> {
    pallet_id: u8,
    call_id: u8,
    call: Call,
}

pub fn moonbeam_xtokens(
    asset: xcm::prelude::VersionedMultiAsset,
    dest: xcm::prelude::VersionedMultiLocation,
) -> Vec<u8> {
    
    #[derive(Clone, Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    struct XTokensCall {
        asset: xcm::prelude::VersionedMultiAsset,
        dest: xcm::prelude::VersionedMultiLocation,
        dest_weight: u64,
    }

    let raw_call_data = UnsignedExtrinsic {
        pallet_id: 0x1e,
        call_id: 0x01,
        call: XTokensCall {
            asset,
            dest,
            dest_weight: 1_000_000_000u64,
        },
    };

    raw_call_data.encode()
}

// Hard-codes DEV token and destination = Moonbase Beta. TODO: Move into substrate_utils test section
pub fn moonbeam_xtokens_demo(dest: [u8; 20], amount: u128) -> Vec<u8> {
    let alpha_dev_asset = xcm::prelude::VersionedMultiAsset::from(
        MultiAsset{
            id: AssetId::Concrete(
                MultiLocation{
                    parents: 0u8,
                    interior: Junctions::X1(Junction::PalletInstance(3u8)),
                }
            ),
            fun: xcm::latest::Fungibility::from(amount),
        }
    );
    let dest_location = xcm::prelude::VersionedMultiLocation::from(
        MultiLocation{
            parents: 1u8,
            interior: Junctions::X2(
                Junction::Parachain(888),
                Junction::AccountKey20{
                    network: NetworkId::Any,
                    key: dest,
                }
            ),
        }
    );

    moonbeam_xtokens(alpha_dev_asset, dest_location)
}

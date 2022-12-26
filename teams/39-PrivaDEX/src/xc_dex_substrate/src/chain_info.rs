use ink_prelude::{
    string::{String, ToString},
    vec::Vec,
    // vec,
    format,
};
use core::convert::{TryFrom, TryInto};
use hex_literal::hex;
use sp_core_hashing;
use scale::{Decode, Encode};
use pink_extension as pink;
use pink::chain_extension::{signing, SigType};
use pink_web3::types::Address as EthAddress;

pub use xcm::prelude as xcm_prelude;
use xcm::latest::{
    AssetId,
    MultiAsset,
    MultiLocation,
    Junction,
    Junctions,
    NetworkId,
};

pub use ss58_registry::Ss58AddressFormat;


#[derive(Encode, Decode, Debug, PartialEq, Eq, Copy, Clone)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum AddressType {
    Ethereum,
    SS58,
}

#[derive(Encode, Decode, Debug, PartialEq, Eq, Copy, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        InvalidAddress,
        NoPathFromSrcToDest,
        UnsupportedChain,
    }

#[derive(Encode, Decode, Debug, PartialEq, Eq, Copy, Clone)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum SignatureScheme {
    Ethereum,
    Sr25519,
}

impl SignatureScheme {
    pub fn prefix_then_sign_msg(&self, msg: &[u8], secret_key: &[u8]) -> Vec<u8> {
        self.sign(&self.prefix_msg(msg), secret_key)
    }

    pub fn sign(&self, msg: &[u8], secret_key: &[u8]) -> Vec<u8> {
        match self {
            SignatureScheme::Ethereum => signing::ecdsa_sign_prehashed(secret_key, sp_core_hashing::keccak_256(msg)).to_vec(),
            SignatureScheme::Sr25519 => signing::sign(msg, secret_key, SigType::Sr25519)
        }
    }

    pub fn verify_unprefixed_msg(&self, pubkey: &[u8], msg: &[u8], signature: &[u8]) -> bool {
        let prefixed_msg = self.prefix_msg(msg);
        self.verify(pubkey, &prefixed_msg, signature)
    }

    pub fn verify(&self, pubkey: &[u8], msg: &[u8], signature: &[u8]) -> bool {
        match self {
            SignatureScheme::Ethereum => 
                if let (Ok(s), Ok(p)) = (signature.try_into(), pubkey.try_into()) {
                    signing::ecdsa_verify_prehashed(s, sp_core_hashing::keccak_256(msg), p)
                } else { false },
            SignatureScheme::Sr25519 =>
                signing::verify(msg, pubkey, signature, SigType::Sr25519),
        }
    }

    pub fn get_address_type(&self) -> AddressType {
        match self {
            SignatureScheme::Ethereum => AddressType::Ethereum,
            SignatureScheme::Sr25519 => AddressType::SS58,
        }
    }

    pub fn prefix_msg(&self, msg: &[u8]) -> Vec<u8> {
        if self == &SignatureScheme::Ethereum {
            // https://github.com/ethereum/go-ethereum/issues/3731
            [format!("\x19Ethereum Signed Message:\n{}", msg.len()).as_bytes(), msg].concat()
        } else { msg.to_vec() }
    }
}

type ChainId = u32;

#[derive(Encode, Decode, Debug, PartialEq, Eq, Copy, Clone)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum RelayChain {
    Polkadot,
    Kusama,
    Westend,
    Rococo,
    MoonbaseRelay,
}

// #[derive(Encode, Decode, Debug, PartialEq, Eq, Copy, Clone)]
// #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
// pub enum StandaloneChain {
//     Phala_PoC5,
// }

#[derive(Encode, Decode, Debug, PartialEq, Eq, Copy, Clone)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum UniversalChainId {
    SubstrateRelayChain(RelayChain),
    SubstrateParachain(RelayChain, ChainId),
    // SubstrateStandalone(StandaloneChain),
    // EVM(ChainId),
}

impl UniversalChainId {
    pub fn get_parachain_id(&self) -> Option<u32> {
        if let UniversalChainId::SubstrateParachain(_, parachain_id) = self {
            Some(parachain_id.clone())
        } else { None }
    }
}

pub mod universal_chain {
    use super::{RelayChain, UniversalChainId};

    pub const MOONBEAM: UniversalChainId = UniversalChainId::SubstrateParachain(RelayChain::Polkadot, 1284);
    pub const MOONBASE_ALPHA: UniversalChainId = UniversalChainId::SubstrateParachain(RelayChain::MoonbaseRelay, 1000);
    pub const MOONBASE_BETA: UniversalChainId = UniversalChainId::SubstrateParachain(RelayChain::MoonbaseRelay, 888);
    pub const KHALA: UniversalChainId = UniversalChainId::SubstrateParachain(RelayChain::Kusama, 2004);
    pub const POLKADOT: UniversalChainId = UniversalChainId::SubstrateRelayChain(RelayChain::Polkadot);
}

pub struct ChainInfo {
    pub chain_id: UniversalChainId,
    pub ss58_prefix: Option<Ss58AddressFormat>,
    pub sig_scheme: SignatureScheme,
    pub rpc_url: String,
    pub eth_dex_router: Option<EthAddress>,
}

fn get_address_format(network_name: &str) -> Option<Ss58AddressFormat> {
    // Raw registry is at https://github.com/paritytech/ss58-registry/blob/main/ss58-registry.json
	match Ss58AddressFormat::try_from(network_name) {
		Ok(version) => Some(version),
		Err(_e) => match network_name { // custom overrides
			// Can look up Subtrate ss58_prefix  at polkadot.js.org/apps -> ChainState -> Constants -> system.ss58Prefix
			"moonbase-alpha" => Some(Ss58AddressFormat::custom(1287)),
            "moonbase-beta" => Some(Ss58AddressFormat::custom(1287)),
            "khala" => Some(Ss58AddressFormat::custom(30)),
			_ => return None,
		},
	}
}

pub fn get_chain_info(network_name: &str) -> Option<ChainInfo> {
    // Can look up Subtrate chain_id at polkadot.js.org/apps -> ChainState -> Storage -> parachainInfo.parachainId
    let ss58_prefix = get_address_format(network_name);
    match network_name {
        "moonbase-alpha" => {
            let chain_id = universal_chain::MOONBASE_ALPHA;
            let sig_scheme = SignatureScheme::Ethereum;
            let rpc_url = "https://moonbeam-alpha.api.onfinality.io/public".to_string();
            let eth_dex_router = Some(EthAddress{0: hex!("8a1932d6e26433f3037bd6c3a40c816222a6ccd4")}); // Uniswap V2 fork
            Some(ChainInfo{chain_id, ss58_prefix, sig_scheme, rpc_url, eth_dex_router})
        },
        "moonbase-beta" => {
            let chain_id = universal_chain::MOONBASE_BETA;
            let sig_scheme = SignatureScheme::Ethereum;
            let rpc_url = "https://frag-moonbase-beta-rpc.g.moonbase.moonbeam.network".to_string();
            Some(ChainInfo{chain_id, ss58_prefix, sig_scheme, rpc_url, eth_dex_router: None})
        },
        "moonbeam" => {
            let chain_id = universal_chain::MOONBEAM;
            let sig_scheme = SignatureScheme::Ethereum;
            let rpc_url = "https://moonbeam.public.blastapi.io".to_string();
            let eth_dex_router = Some(EthAddress{0: hex!("70085a09d30d6f8c4ecf6ee10120d1847383bb57")}); // StellaSwap: Router v2.1
            Some(ChainInfo{chain_id, ss58_prefix, sig_scheme, rpc_url, eth_dex_router})
        },
        "khala" => {
            let chain_id = universal_chain::KHALA;
            let sig_scheme = SignatureScheme::Sr25519;
            let rpc_url = "https://khala.api.onfinality.io/rpc?apikey=3415143a-c3b4-42ae-8625-7613025ac69c".to_string();
            Some(ChainInfo{chain_id, ss58_prefix, sig_scheme, rpc_url, eth_dex_router: None})
        },
        "polkadot" => {
            let chain_id = universal_chain::POLKADOT;
            let sig_scheme = SignatureScheme::Sr25519;
            let rpc_url = "https://polkadot.api.onfinality.io/rpc?apikey=3415143a-c3b4-42ae-8625-7613025ac69c".to_string();
            Some(ChainInfo{chain_id, ss58_prefix, sig_scheme, rpc_url, eth_dex_router: None})
        },
        _ => None,
    }
}

pub fn dest_to_versioned_multilocation<'a>(
    src_chain_info: &'a ChainInfo,
    dest_chain_info: &'a ChainInfo,
    dest_addr: &[u8]
) -> Result<xcm::prelude::VersionedMultiLocation, Error> {
    let dest_junction = match dest_chain_info.sig_scheme {
        SignatureScheme::Ethereum => {
            let addr: [u8; 20] = dest_addr.try_into().map_err(|_| Error::InvalidAddress)?;
            Junction::AccountKey20 { network: NetworkId::Any, key: addr }
        },
        SignatureScheme::Sr25519 => {
            let addr: [u8; 32] = dest_addr.try_into().map_err(|_| Error::InvalidAddress)?;
            Junction::AccountId32 { network: NetworkId::Any, id: addr }
        },
    };
    let multilocation = match (src_chain_info.chain_id, dest_chain_info.chain_id) {
        (UniversalChainId::SubstrateParachain(src_relay, _),
         UniversalChainId::SubstrateParachain(dest_relay, dest_parachain_id)) => {
            if src_relay != dest_relay {
                return Err(Error::NoPathFromSrcToDest);
            }
            MultiLocation{
                parents: 1u8,
                interior: Junctions::X2(
                    Junction::Parachain(dest_parachain_id),
                    dest_junction
                ),
            }
        },
        (UniversalChainId::SubstrateRelayChain(src_relay),
         UniversalChainId::SubstrateParachain(dest_relay, dest_parachain_id)) => {
            if src_relay != dest_relay {
                return Err(Error::NoPathFromSrcToDest);
            }
            MultiLocation{
                parents: 0u8,
                interior: Junctions::X2(
                    Junction::Parachain(dest_parachain_id),
                    dest_junction
                ),
            }
        },
        (UniversalChainId::SubstrateParachain(src_relay, _),
         UniversalChainId::SubstrateRelayChain(dest_relay)) => {
            if src_relay != dest_relay {
                return Err(Error::NoPathFromSrcToDest);
            }
            MultiLocation{
                parents: 1u8,
                interior: Junctions::X1(
                    dest_junction
                ),
            }
        },
        _ => return Err(Error::NoPathFromSrcToDest),
    };
    Ok(xcm::prelude::VersionedMultiLocation::from(multilocation))
}

// Uniquely identifies any token on a *single chain*. Note that there may be multiple
// ways to identify the same asset e.g. on Moonbase-Alpha,
// xcUNIT = ERC20(0xffffffff1fcacbd218edc0eba20fc2308c778080)
// = GeneralAsset(42,259,045,809,535,163,221,576,417,993,425,387,648)
// [see https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwss.api.moonbase.moonbeam.network#/assets]
#[derive(Encode, Decode, Debug, PartialEq, Eq, Copy, Clone)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum ChainToken {
    Native, // e.g. GLMR for Moonbeam
    Relay, // e.g. DOT for Moonbeam
    ERC20(EthAddress),
    GeneralAsset(u128),
}

impl ChainToken {
    pub fn to_versioned_multiasset(&self, network: UniversalChainId, amount: u128) -> Option<xcm::prelude::VersionedMultiAsset> {
        if let Some(asset_multilocation) = self.to_multilocation(network) {
            Some(
                xcm::prelude::VersionedMultiAsset::from(
                MultiAsset{
                    id: AssetId::Concrete(asset_multilocation),
                    fun: xcm::latest::Fungibility::from(amount),
                })
            )
        } else { None }
    }

    fn to_multilocation(&self, network: UniversalChainId) -> Option<MultiLocation> {
        match network {
            // Based on https://docs.moonbeam.network/builders/xcm/xc20/xtokens/#xtokens-transfer-multiasset-function
            UniversalChainId::SubstrateParachain(RelayChain::MoonbaseRelay, _) | universal_chain::MOONBEAM => {
                match self {
                    ChainToken::Native => {
                        Some(MultiLocation{
                            parents: 0u8,
                            interior: Junctions::X1(Junction::PalletInstance(3u8)),
                        })
                    },
                    ChainToken::Relay => {
                        Some(MultiLocation{
                            parents: 1u8,
                            interior: Junctions::Here,
                        })
                    },
                    ChainToken::ERC20(eth_addr) => {
                        let asset_id = Self::moon_erc20_addr_to_asset_id(eth_addr);
                        ChainToken::GeneralAsset(asset_id).to_multilocation(network)
                    },
                    ChainToken::GeneralAsset(asset_id) => {
                        Self::moon_general_asset_to_multilocation(network, asset_id)
                    },
                }
            },
            universal_chain::KHALA => {
                match self {
                    ChainToken::Native => {
                        Some(MultiLocation{
                            parents: 0u8,
                            interior: Junctions::Here,
                        })
                    },
                    ChainToken::GeneralAsset(_asset_id) => {
                        // TODO: use assetsRegistry.registryInfoByIds
                        None
                    },
                    _ => None,
                }
            },
            _ => None
        }
    }

    fn moon_general_asset_to_multilocation(network: UniversalChainId, asset_id: &u128) -> Option<MultiLocation> {
        match (network, asset_id) {
            // First handle external XC20s that are native to other chains
            (universal_chain::MOONBASE_BETA, 222902676330054289648817870329963141953) => {
                // xcDEV (Moonbase Alpha native token)
                let parachain_id = universal_chain::MOONBASE_ALPHA.get_parachain_id()?;
                Some(MultiLocation {
                    parents: 1u8,
                    interior: Junctions::X2(Junction::Parachain(parachain_id), Junction::PalletInstance(3u8))
                })
            },
            (universal_chain::MOONBASE_ALPHA, 42259045809535163221576417993425387648) => {
                // xcUNIT (Moonbase Relay native token)
                ChainToken::Relay.to_multilocation(universal_chain::MOONBASE_ALPHA)
            },
            (universal_chain::MOONBEAM, 42259045809535163221576417993425387648) => {
                // xcDOT (Polkadot native token)
                ChainToken::Relay.to_multilocation(universal_chain::MOONBEAM)
            },
            // Mintable XC20 is not native to any other chain
            (_, _) => {
                Some(MultiLocation{
                    parents: 1u8,
                    interior: Junctions::X2(Junction::PalletInstance(36u8), Junction::GeneralIndex(asset_id.clone())),
                })
            }
        }
    }

    fn moon_erc20_addr_to_asset_id(addr: &EthAddress) -> u128 {
        // Implements the logic outlined in https://docs.moonbeam.network/builders/xcm/xc20/xc20/#calculate-xc20-address
        let suffix: [u8; 16] = addr.as_bytes()[4..].try_into().unwrap();
        u128::from_be_bytes(suffix)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use hex_literal::hex;
    use ink_env::debug_println;

    #[test]
    fn moonbeam_chain_token_convert_works() {
        // xcAlphaDev on Moonbase Beta
        let eth_addr = EthAddress{0: hex!("ffffffffa7b17e706a2391f346d8c82b6788db41")};
        let alpha_dev_asset_id: u128 = 222902676330054289648817870329963141953;

        let asset_id = ChainToken::moon_erc20_addr_to_asset_id(&eth_addr);
        debug_println!("Asset ID = {}", asset_id);
        assert_eq!(asset_id, alpha_dev_asset_id);
    }
}

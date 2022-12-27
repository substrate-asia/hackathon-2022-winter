use ink_env::debug_println;
use ink_prelude::{
    string::{String, ToString},
    vec::Vec,
    vec,
    format,
};
use scale::{Compact, Decode, Encode};
use serde::Deserialize;
use sp_runtime::{
    MultiAddress,
    MultiSignature,
    OpaqueExtrinsic,
    traits::BlakeTwo256,
    generic::{
        Block as GenericBlock,
        Era,
        Header as GenericHeader,
        SignedBlock as GenericSignedBlock,
    },
};

use sp_core::{sr25519, hash::H256};
use pink_extension as pink;
use pink::http_post;
use pink::chain_extension::{signing, SigType};
use core::fmt::Write;

// I've spent hours trying to figure out how to import from a different file/crate but it has been beyond painful 
// and I've gotten nowhere. Doing this janky solution for now
#[path =  "./chain_info.rs"]
pub mod chain_info;
// use phat_chain::chain_info::SignatureScheme;
// use crate::chain_info;
use chain_info::SignatureScheme;


#[derive(Debug, PartialEq, Eq, Encode, Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum Error {
    InvalidBody,
    InvalidHex,
    NotFound,
    RequestFailed,
}

/// Type alias for the contract's result type.
pub type Result<T> = core::result::Result<T, Error>;

pub struct SubstrateUtils {
    pub rpc_url: String,
}

pub struct ExtrinsicSigConfig<AccountId> {
    pub sig_scheme: SignatureScheme,
    pub signer: AccountId,
    pub privkey: Vec<u8>,
}

impl<AccountId> ExtrinsicSigConfig<AccountId> where AccountId: Copy + Encode {
    /// Do NOT call `encode` on the results of get_encoded_*() because it is already encoded
    
    pub fn get_encoded_signer(&self) -> Vec<u8> {
        match self.sig_scheme {
            SignatureScheme::Ethereum => self.signer.encode(),
            SignatureScheme::Sr25519 => MultiAddress::<AccountId, u32>::Id(self.signer).encode(),
        }
    }

    pub fn get_encoded_signature(&self, encoded_data: Vec<u8>) -> Vec<u8> {
        let payload = if encoded_data.len() > 256 {
            sp_core_hashing::blake2_256(&encoded_data).to_vec()
        } else { encoded_data };

        match self.sig_scheme {
            // Use Keccak-256 hasher instead of Blake2-256 (which is the ECDSA default)
            SignatureScheme::Ethereum => signing::ecdsa_sign_prehashed(
                &self.privkey, sp_core_hashing::keccak_256(&payload)
            ).to_vec(),
            SignatureScheme::Sr25519 => {
                let signature = signing::sign(&payload, &self.privkey, SigType::Sr25519);
                MultiSignature::from(
                    sr25519::Signature::try_from(signature.as_slice())
                    .expect("Expected 64-byte raw signature")
                ).encode()
            }
        }
    }
}

#[derive(Encode, Decode, Clone, Debug, PartialEq)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub struct RuntimeVersion {
    spec_name: String,
    impl_name: String,
    authoring_version: u32,
    spec_version: u32,
    impl_version: u32,
    apis: Vec<(String, u32)>,
    transaction_version: u32,
    state_version: u32,
}

type BlockNumber = u32;
type Header = GenericHeader<BlockNumber, BlakeTwo256>;
pub type Block = GenericBlock<Header, OpaqueExtrinsic>;
type SignedBlock = GenericSignedBlock<Block>;

#[derive(Deserialize, Debug)]
#[allow(dead_code)]
struct RpcResponse<'a, T> {
    jsonrpc: &'a str,
    result: T,
    id: u32,
}

#[derive(Deserialize, Debug)]
#[allow(dead_code)]
struct StrRefRpcResponse<'a> {
    jsonrpc: &'a str,
    result: &'a str,
    id: u32,
}

impl SubstrateUtils {
    pub fn get_next_nonce(&self, account_id: &str) -> Result<u32> {
        let data = format!(
            r#"{{"id":1,"jsonrpc":"2.0","method":"system_accountNextIndex","params":["{}"]}}"#,
            account_id
        ).into_bytes();

        let resp_body = self.call_rpc(data)?;
        let (next_nonce, _): (RpcResponse<u32>, usize) =
            serde_json_core::from_slice(&resp_body).or(Err(Error::InvalidBody))?;
        Ok(next_nonce.result)
    }

    pub fn get_runtime_version(&self) -> Result<RuntimeVersion> {
        #[derive(Deserialize, Debug)]
        #[allow(dead_code)]
        struct RawRuntimeVersion<'a> {
            jsonrpc: &'a str,
            #[serde(borrow)]
            result: RuntimeVersionResult<'a>,
            id: u32,
        }

        #[derive(Deserialize, Encode, Clone, Debug, PartialEq)]
        #[serde(bound(deserialize = "ink_prelude::vec::Vec<(&'a str, u32)>: Deserialize<'de>"))]
        #[allow(non_snake_case)] // camelCase allows for the derived deserialize to work out of the box
        struct RuntimeVersionResult<'a> {
            specName: &'a str,
            implName: &'a str,
            authoringVersion: u32,
            specVersion: u32,
            implVersion: u32,
            #[serde(borrow)]
            apis: Vec<(&'a str, u32)>,
            transactionVersion: u32,
            stateVersion: u32,
        }

        let data =
            r#"{"id":1, "jsonrpc":"2.0", "method": "state_getRuntimeVersion"}"#
                .to_string()
                .into_bytes();
        let resp_body = self.call_rpc(data)?;
        let (runtime_version, _): (RawRuntimeVersion, usize) =
            serde_json_core::from_slice(&resp_body).or(Err(Error::InvalidBody))?;
        let runtime_version_result = runtime_version.result;
        let mut api_vec: Vec<(String, u32)> = Vec::new();
        for (api_str, api_u32) in runtime_version_result.apis {
            api_vec.push((api_str.to_string().parse().unwrap(), api_u32));
        }

        let runtime_version = RuntimeVersion {
            spec_name: runtime_version_result.specName.to_string().parse().unwrap(),
            impl_name: runtime_version_result.implName.to_string().parse().unwrap(),
            authoring_version: runtime_version_result.authoringVersion,
            spec_version: runtime_version_result.specVersion,
            impl_version: runtime_version_result.implVersion,
            apis: api_vec,
            transaction_version: runtime_version_result.transactionVersion,
            state_version: runtime_version_result.stateVersion,
        };

        Ok(runtime_version)
    }

    pub fn get_block_hash(&self, block_number: u32) -> Result<H256> {
        let data = format!(
            r#"{{"id":1, "jsonrpc":"2.0", "method": "chain_getBlockHash","params":[{}]}}"#,
            block_number
        ).into_bytes();
        let resp_body = self.call_rpc(data)?;
        let (block_hash, _): (StrRefRpcResponse, usize) =
            serde_json_core::from_slice(&resp_body).or(Err(Error::InvalidBody))?;

        let v = hex_string_to_vec(block_hash.result)?;
        Ok(H256::from_slice(&v))
    }

    pub fn get_genesis_hash(&self) -> Result<H256> {
        self.get_block_hash(0)
    }

    pub fn get_finalized_head_hash(&self) -> Result<H256> {
        let data =
            r#"{"id":1, "jsonrpc":"2.0", "method": "chain_getFinalizedHead"}"#
                .to_string()
                .into_bytes();
        let resp_body = self.call_rpc(data)?;
        let (finalized_head_hash, _): (StrRefRpcResponse, usize) =
            serde_json_core::from_slice(&resp_body).or(Err(Error::InvalidBody))?;

        let v = hex_string_to_vec(finalized_head_hash.result)?;
        Ok(H256::from_slice(&v))
    }

    pub fn get_finalized_block_number(&self) -> Result<BlockNumber> {
        // It is critical that the module and method are upper-cased to compute the correct storage key!
        let resp_body = self.query_storage("System", "Number")?;
        // debug_println!("Json string response: {:?}", String::from_utf8(resp_body.clone()));
        // This is messy decoding, but we can clean this up later
        let (number_encoded, _): (StrRefRpcResponse, usize) =
            serde_json_core::from_slice(&resp_body).or(Err(Error::InvalidBody))?;
        let number_bytes = hex_string_to_vec(number_encoded.result)?;
        let number = <BlockNumber as scale::Decode>::decode(&mut number_bytes.as_slice())
            .map_err(|_| Error::InvalidBody)?;

        Ok(number)
    }

    #[allow(dead_code)]
    fn get_block_header_unsafe(&self, block_hash: H256) -> Result<Header> {
        /*
         * NOTE: This is not usable in an ink contract / Phat Contract because the getBlock
         * call may (and likely will) return too much data. This causes a panic:
         * "the output buffer is too small! the decoded storage is of size ___ bytes,
         * but the output buffer has only room for 1638
         * (https://github.com/paritytech/ink/blob/e883ce5088553c93b49493e43185ce05485399d3/crates/env/src/engine/off_chain/impls.rs)
         */
        let data = format!(
            r#"{{"id":1, "jsonrpc":"2.0", "method": "chain_getBlock","params":["{}"]}}"#,
            slice_to_hex_string(&block_hash.0)
        ).into_bytes();
        let resp_body = self.call_rpc(data)?;
        
        let (header, _): (RpcResponse<Header>, usize) =
            serde_json_core::from_slice(&resp_body).or(Err(Error::InvalidBody))?;
        Ok(header.result)
    }

    #[allow(dead_code)]
    fn get_block_unsafe(&self, block_hash: H256) -> Result<SignedBlock> {
        /*
         * NOTE: This is not usable in an ink contract / Phat Contract because the getBlock
         * call may (and likely will) return too much data. This causes a panic:
         * "the output buffer is too small! the decoded storage is of size ___ bytes,
         * but the output buffer has only room for 1638
         * (https://github.com/paritytech/ink/blob/e883ce5088553c93b49493e43185ce05485399d3/crates/env/src/engine/off_chain/impls.rs)
         */
        let data = format!(
            r#"{{"id":1, "jsonrpc":"2.0", "method": "chain_getBlock","params":["{}"]}}"#,
            slice_to_hex_string(&block_hash.0)
        ).into_bytes();

        let resp_body = self.call_rpc(data)?;
        // debug_println!("Raw body: {:?}", resp_body);
        
        let (signed_block, _): (RpcResponse<SignedBlock>, usize) =
            serde_json_core::from_slice(&resp_body).or(Err(Error::InvalidBody))?;
        
        let opaque_extrinsic: &OpaqueExtrinsic = &signed_block.result.block.extrinsics[2];
        // Used https://github.com/paritytech/substrate-api-sidecar/blob/master/src/services/blocks/BlocksService.ts#L476
        // as a reference to find how to calculate extrinsic hash
        let extrinsic_hash: [u8; 32] = sp_core_hashing::blake2_256(&opaque_extrinsic.encode());
        debug_println!("Signed block: {:?}", signed_block);
        debug_println!("Extrinsic hash: {:?}", slice_to_hex_string(&extrinsic_hash));
        Ok(signed_block.result)
    }

    fn query_storage(&self, module: &str, method: &str) -> Result<Vec<u8>> {
        let storage_key = {
            let mut vec = Vec::new();
            vec.extend(sp_core_hashing::twox_128(module.as_bytes()));
            vec.extend(sp_core_hashing::twox_128(method.as_bytes()));
            slice_to_hex_string(&vec)
        };
        // debug_println!("Storage key: {:?}", &storage_key);
        let data = format!(
            r#"{{"id":1,"jsonrpc":"2.0","method":"state_getStorage","params":["{}"]}}"#,
            storage_key
        ).into_bytes();
        self.call_rpc(data)
    }

    pub fn create_extrinsic<AccountId>(
        &self,
        sigconfig: ExtrinsicSigConfig<AccountId>,
        encoded_call_data: &[u8],
        account_nonce: u32,
        runtime_version: RuntimeVersion,
        genesis_hash: H256,
        checkpoint_block_hash: H256,
        era: Era,
        tip: u128,
    ) -> Vec<u8>
        where AccountId: Copy + Encode
    {

        #[derive(Encode, Decode, Clone, Debug, Eq, PartialEq)]
        #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
        struct Extra {
            // 0 if Immortal, or Vec<u64, u64> for period and the phase.
            era: Era,
            // Nonce
            nonce: Compact<u32>,
            // Tip for the block producer.
            tip: Compact<u128>,
        }

        // Construct the extra param
        let extra = Extra {
            era,
            nonce: Compact(account_nonce),
            tip: Compact(tip),
        };

        // Construct our custom additional params.
        let additional_params = (
            runtime_version.spec_version,
            runtime_version.transaction_version,
            genesis_hash.0,
            checkpoint_block_hash.0,
        );

        let encoded_payload = {
            let mut encoded_inner = Vec::new();
            encoded_inner.extend(encoded_call_data);
            extra.encode_to(&mut encoded_inner);
            additional_params.encode_to(&mut encoded_inner);
            encoded_inner
        };
        // Construct signature
        let encoded_signature = sigconfig.get_encoded_signature(encoded_payload);

        debug_println!("Extrinsic head (isSigned + extrinsic version): {:?}", slice_to_hex_string(&(0b10000000 + 4u8).encode()));
        debug_println!("Signature: {:?}", slice_to_hex_string(&encoded_signature));
        debug_println!("Extra: {:?}", slice_to_hex_string(&extra.encode()));
        debug_println!("Call data: {:?}", slice_to_hex_string(encoded_call_data));

        // Encode Extrinsic
        let extrinsic = {
            let mut encoded_inner = Vec::new();
            // "is signed" + tx protocol v4
            (0b10000000 + 4u8).encode_to(&mut encoded_inner);
            // from address for signature
            encoded_inner.extend(&sigconfig.get_encoded_signer());
            // the signature bytes
            encoded_inner.extend(&encoded_signature);
            // attach custom extra params
            extra.encode_to(&mut encoded_inner);
            // and now, call data
            encoded_inner.extend(encoded_call_data);
            // now, prefix byte length:
            let len = Compact(
                u32::try_from(encoded_inner.len()).expect("extrinsic size expected to be <4GB"),
            );
            let mut encoded = Vec::new();
            len.encode_to(&mut encoded);
            encoded.extend(encoded_inner);
            encoded
        };

        extrinsic
    }

    pub fn send_extrinsic(&self, extrinsic_hash: &[u8]) -> Result<H256> {
        let hex_extrinsic = slice_to_hex_string(extrinsic_hash);
        let data = format!(
            r#"{{"id":1,"jsonrpc":"2.0","method":"author_submitExtrinsic","params":["{}"]}}"#,
            hex_extrinsic
        ).into_bytes();
        let resp_body = self.call_rpc(data)?;
        let (tx, _): (StrRefRpcResponse, usize) =
            serde_json_core::from_slice(&resp_body).or(Err(Error::InvalidBody))?;
        let v = hex_string_to_vec(tx.result)?;
        Ok(H256::from_slice(&v))
    }

    pub fn find_extrinsic(&self, _extrinsic_hash: H256, block_number: u32) -> Result<u32 /* extrinsic_index */> {
        // For whatever reason this is actually really hard because I don't know how to compute the extrinsic hash
        // and it is not written in the block directly. TODO: Implement later! Dummy behavior for now
        // Err(Error::NotFound)
        let block_hash = self.get_block_hash(block_number)?;
        debug_println!("Block hash: {:?}", block_hash);
        let _ = self.get_block_unsafe(block_hash)?;
        Ok(99u32)
    }

    fn call_rpc(&self, data: Vec<u8>) -> Result<Vec<u8>> {
        let content_length = format!("{}", data.len());
        let headers: Vec<(String, String)> = vec![
            ("Content-Type".into(), "application/json".into()),
            ("Content-Length".into(), content_length),
        ];
    
        debug_println!("Calling RPC");
        let response = http_post!(&self.rpc_url, data, headers);
        debug_println!("Response: {}, {}", response.status_code, response.reason_phrase);
        if response.status_code != 200 {
            return Err(Error::RequestFailed);
        }
    
        let body = response.body;
        // debug_println!("Json string response: {:?}", String::from_utf8(body.clone()));
        Ok(body)
    }
}

pub fn slice_to_hex_string(v: &[u8]) -> String {
    let mut res = "0x".to_string();
    for a in v.iter() {
        write!(res, "{:02x}", a).expect("should create hex string");
    }
    res
}

pub fn hex_string_to_vec(s: &str) -> Result<Vec<u8>> {
    if "0x" != &s[..2] {
        return Err(Error::InvalidHex);
    }
    hex::decode(&s[2..]).map_err(|_| Error::InvalidHex)
}


#[cfg(test)]
#[path =  "./extrinsic_call_factory.rs"]
mod extrinsic_call_factory;

#[cfg(test)]
mod tests {
    use super::*;
    use hex_literal::hex;
    use core::str::FromStr;

    fn utils(chain: &str) -> SubstrateUtils {
        let rpc_endpoint = match chain {
            "moonbeam" => "https://moonbeam.public.blastapi.io",
            // "moonbase-alpha" => "https://rpc.api.moonbase.moonbeam.network", // doesn't support author_submitExtrinsic on HTTP (only WS)
            "moonbase-alpha" => "https://moonbeam-alpha.api.onfinality.io/public",
            "khala" => "https://khala.api.onfinality.io/rpc?apikey=3415143a-c3b4-42ae-8625-7613025ac69c",
            "polkadot" => "https://polkadot.api.onfinality.io/rpc?apikey=3415143a-c3b4-42ae-8625-7613025ac69c",
            _ => panic!("Unknown chain"),
        };
        SubstrateUtils{
            rpc_url: rpc_endpoint.to_string(),
        }
    }
    
    #[test]
    fn moonbeam_nonce() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let address = "0x05a81d8564a3eA298660e34e03E5Eff9a29d7a2A";
        let nonce = utils("moonbeam").get_next_nonce(address).expect("Expected valid nonce");
        assert!(nonce > 100);
    }

    #[test]
    fn moonbeam_genesis() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let genesis_hash = utils("moonbeam").get_genesis_hash().expect("Expected valid genesis hash");
        debug_println!("genesis hash: {}", genesis_hash);
        assert_eq!(genesis_hash, H256{0: hex!("fe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d")});
    }

    #[test]
    fn moonbeam_finalized_head_hash() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let finalized_head = utils("moonbeam").get_finalized_head_hash().expect("Expected valid finalized head hash");
        debug_println!("finalized head hash: {}", finalized_head);
    }

    #[test]
    fn moonbeam_block_number() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let block_num = utils("moonbeam").get_finalized_block_number().expect("Expected valid finalized block number");
        debug_println!("block num: {}", block_num);
        assert!(block_num > 2_475_364u32);
    }

    #[test]
    fn moonbeam_runtime_version() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let runtime_version = utils("moonbeam").get_runtime_version().expect("Expected valid runtime version");
        debug_println!("Runtime version: {:?}", runtime_version);
        assert_eq!(runtime_version.impl_name, "moonbeam");
        assert!(runtime_version.apis.len() > 0);
    }

    #[test]
    fn moonbase_find_extrinsic() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let block_num = 1000u32;
        // let block_num = 3_144_185u32; // This will cause a failure! See the comment on get_block(...) regarding buffer size
        let _ = utils("moonbase-alpha").find_extrinsic(H256::zero(), block_num).expect("Failure");
    }

    #[test]
    fn moonbeam_extrinsic() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        use extrinsic_call_factory::moonbeam_xtokens_demo;

        let chain_utils = utils("moonbase-alpha");
        let sender = hex!("05a81d8564a3eA298660e34e03E5Eff9a29d7a2A");

        let kap_privkey = {
            let privkey_str = std::env::var("KAP_PRIVATE_KEY").expect("Env var KAP_PRIVATE_KEY is not set");
            H256::from_str(&privkey_str).expect("KAP_PRIVATE_KEY to_hex failed")
        };
        let sigconfig = ExtrinsicSigConfig::<[u8; 20]>{
            sig_scheme: SignatureScheme::Ethereum,
            signer: sender,
            privkey: kap_privkey.0.to_vec(),
        };
        
        let nonce = chain_utils.get_next_nonce(&slice_to_hex_string(&sender))
            .expect("Expected valid nonce");
        debug_println!("nonce: {:?}", nonce);
        let runtime_version = chain_utils.get_runtime_version().expect("Expected valid runtime version");
        debug_println!("runtime_version: {:?}", runtime_version);
        let genesis_hash = chain_utils.get_genesis_hash().expect("Expected valid genesis hash");
        debug_println!("genesis_hash: {:?}", genesis_hash);
        let era = Era::Immortal;
        let finalized_head = if era != Era::Immortal {
            chain_utils.get_finalized_head_hash().expect("Expected valid finalized head hash")
        } else { genesis_hash.clone() };
        debug_println!("finalized_head_hash: {:?}", finalized_head);

        let encoded_call_data = moonbeam_xtokens_demo(sender /* dest */, 1_000_000_000_000_000u128 /* amount */);
        let tx_raw = chain_utils.create_extrinsic::<[u8; 20]>(
            sigconfig,
            &encoded_call_data,
            nonce,
            runtime_version,
            genesis_hash,
            finalized_head, // checkpoint block hash
            era,
            0, // tip
        );
        debug_println!("Raw txn: {:?}", slice_to_hex_string(&tx_raw));
        // Commented out to avoid actually sending out transactions
        // let send_response = chain_utils.send_extrinsic(&tx_raw);
        // debug_println!("Sent txn: {:?}", send_response);
    }

    #[test]
    fn polkadot_nonce() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let address = "1qnJN7FViy3HZaxZK9tGAA71zxHSBeUweirKqCaox4t8GT7";
        let nonce = utils("polkadot").get_next_nonce(address).expect("Expected valid nonce");
        assert!(nonce > 100_000);
    }

    #[test]
    fn polkadot_genesis() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let genesis_hash = utils("polkadot").get_genesis_hash().expect("Expected valid genesis hash");
        debug_println!("genesis hash: {}", genesis_hash);
        let finalized_head = utils("polkadot").get_finalized_head_hash().expect("Expected valid finalized head hash");
        debug_println!("finalized head hash: {}", finalized_head);
        assert_eq!(genesis_hash, H256{0: hex!("91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3")});
    }

    #[test]
    fn polkadot_runtime_version() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let runtime_version = utils("polkadot").get_runtime_version().expect("Expected valid runtime version");
        debug_println!("Runtime version: {:?}", runtime_version);
        assert_eq!(runtime_version.impl_name, "parity-polkadot");
        assert!(runtime_version.apis.len() > 0);
    }

    #[test]
    fn verify_eth_msg_signature() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let secret_key = hex!("e5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a"); // Alice
        let pubkey = signing::get_public_key(&secret_key, SigType::Ecdsa);
        let msg = "I verify that I submitted transaction 0x80ceab2d79fed91a042507bdf85142e846e4acdaaca4df4e86184b13a50c763c";
        // This is the signature policy used on Moonbeam (https://polkadot.js.org/apps/#/signing/verify)
        let signature: [u8; 65] = SignatureScheme::Ethereum.prefix_then_sign_msg(msg.as_bytes(), &secret_key).try_into().unwrap();
        debug_println!("Raw msg: {:?}", slice_to_hex_string(&msg.as_bytes()));
        debug_println!("Signature: {:?}", slice_to_hex_string(&signature));

        let verified = SignatureScheme::Ethereum.verify_unprefixed_msg(&pubkey, msg.as_bytes(), &signature);
        assert_eq!(verified, true);
    }

    #[test]
    fn verify_sr25519_msg_signature() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let secret_key = hex!("e5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a"); // Alice
        let pubkey = signing::get_public_key(&secret_key, SigType::Sr25519);
        let msg = "test message";
        let signature = signing::sign(msg.as_bytes(), &secret_key, SigType::Sr25519);
        debug_println!("Raw msg: {:?}", slice_to_hex_string(&msg.as_bytes()));
        debug_println!("Signature: {:?}", slice_to_hex_string(&signature));
        let verified = SignatureScheme::Sr25519.verify(&pubkey, msg.as_bytes(), &signature);
        assert_eq!(verified, true);
    }

}

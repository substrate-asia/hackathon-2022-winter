#![cfg_attr(not(feature = "std"), no_std)]
#![allow(clippy::too_many_arguments)]
#![allow(clippy::unnecessary_mut_passed)]

use codec::{Encode, Decode};
use scale_info::TypeInfo;
use sp_std::vec::Vec;
use sp_core::{Hasher};
use sp_runtime::{
    traits::{
        Keccak256
    }
};

pub const TRANSFER: u8 = 1_u8;
pub const MINT: u8 = 3_u8;

#[derive(Decode, Encode, Debug)]
pub struct TokenOpcode {
    pub op: u8,
    pub data: Vec<u8>
}

impl TokenOpcode {
    pub fn new(op: u8, data: Vec<u8>) -> Self {
        Self {
            op,
            data,
        }
    }
}

#[derive(Decode, Encode, Debug)]
pub struct MintTokenOp {
    pub to: [u8; 64],
    pub amount: u128
}

impl MintTokenOp {
    pub fn new(to: [u8; 64], amount: u128) -> Self {
        Self {
            to,
            amount,
        }
    }
}

#[derive(Decode, Encode, Debug)]
pub struct TransferTokenOp {
    pub to: [u8; 64],
    pub amount: u128
}

impl TransferTokenOp {
    pub fn new(to: [u8; 64], amount: u128) -> Self {
        Self {
            to,
            amount,
        }
    }
}

pub fn get_transaction_hash(data: &OmniverseTokenProtocol) -> [u8; 32] {
    let mut raw = Vec::<u8>::new();
    raw.extend_from_slice(&mut u128::to_be_bytes(data.nonce).as_slice());
    raw.extend_from_slice(&mut u8::to_be_bytes(data.chain_id).as_slice());
    raw.extend_from_slice(&mut data.from.clone());
    raw.append(&mut data.to.clone().as_mut());

    let mut bytes_data = Vec::<u8>::new();
    let op_data = TokenOpcode::decode(&mut data.data.as_slice()).unwrap();
    bytes_data.extend_from_slice(&mut u8::to_be_bytes(op_data.op).as_slice());
    
    if op_data.op == TRANSFER {
        let transfer_data = TransferTokenOp::decode(&mut op_data.data.as_slice()).unwrap();
        bytes_data.extend_from_slice(&mut transfer_data.to.clone());
        bytes_data.extend_from_slice(&mut u128::to_be_bytes(transfer_data.amount).as_slice());
    }
    else if op_data.op == MINT {
        let mint_data = MintTokenOp::decode(&mut op_data.data.as_slice()).unwrap();
        bytes_data.extend_from_slice(&mut mint_data.to.clone());
        bytes_data.extend_from_slice(&mut u128::to_be_bytes(mint_data.amount).as_slice());
    }
    raw.append(&mut bytes_data.as_mut());

    let h = Keccak256::hash(raw.as_slice());
    
    h.0
}
	
#[derive(Clone, PartialEq, Eq, Debug, Encode, Decode, TypeInfo)]
pub enum VerifyResult {
    Success,
    Malicious,
    Duplicated
}

#[derive(Clone, PartialEq, Eq, Debug)]
pub enum VerifyError {
    SignatureError,
    NonceError,
    SignerNotCaller,
}
	
#[derive(Clone, PartialEq, Eq, Debug, Encode, Decode, TypeInfo)]
pub struct OmniverseTokenProtocol {
    pub nonce: u128,
    pub chain_id: u8,
    pub from: [u8; 64],
    pub to: Vec<u8>,
    pub data: Vec<u8>,
    pub signature: [u8; 65]
}

impl OmniverseTokenProtocol {
    pub fn new(nonce: u128, chain_id: u8, from: [u8; 64], to: Vec<u8>, data: Vec<u8>) -> Self {
        Self {
            nonce,
            chain_id,
            from,
            to,
            data,
            signature: [0; 65]
        }
    }

    pub fn get_raw_hash(&self) -> [u8; 32] {
        get_transaction_hash(self)
    }

    pub fn set_signature(&mut self, signature: [u8; 65]) {
        self.signature = signature;
    }
}

pub trait OmniverseAccounts {
    fn verify_transaction(data: &OmniverseTokenProtocol) -> Result<VerifyResult, VerifyError>;
    fn get_transaction_count(pk: [u8; 64]) -> u128;
    fn is_malicious(pk: [u8; 64]) -> bool;
    fn get_chain_id() -> u8;
}
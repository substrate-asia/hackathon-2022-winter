use crate::functions;
use codec::{Decode, Encode};
use scale_info::TypeInfo;
use sp_std::vec::Vec;

pub const TRANSFER: u8 = 1_u8;
pub const MINT: u8 = 3_u8;

#[derive(Decode, Encode, Debug)]
pub struct TokenOpcode {
	pub op: u8,
	pub data: Vec<u8>,
}

impl TokenOpcode {
	pub fn new(op: u8, data: Vec<u8>) -> Self {
		Self { op, data }
	}
}

#[derive(Decode, Encode, Debug)]
pub struct MintTokenOp {
	pub to: [u8; 64],
	pub amount: u128,
}

impl MintTokenOp {
	pub fn new(to: [u8; 64], amount: u128) -> Self {
		Self { to, amount }
	}
}

#[derive(Decode, Encode, Debug)]
pub struct TransferTokenOp {
	pub to: [u8; 64],
	pub amount: u128,
}

impl TransferTokenOp {
	pub fn new(to: [u8; 64], amount: u128) -> Self {
		Self { to, amount }
	}
}

#[derive(Clone, PartialEq, Eq, Debug, Encode, Decode, TypeInfo)]
pub enum VerifyResult {
	Success,
	Malicious,
	Duplicated,
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
	pub signature: [u8; 65],
}

impl OmniverseTokenProtocol {
	pub fn new(nonce: u128, chain_id: u8, from: [u8; 64], to: Vec<u8>, data: Vec<u8>) -> Self {
		Self { nonce, chain_id, from, to, data, signature: [0; 65] }
	}

	pub fn get_raw_hash(&self) -> [u8; 32] {
		functions::get_transaction_hash(self)
	}

	pub fn set_signature(&mut self, signature: [u8; 65]) {
		self.signature = signature;
	}
}

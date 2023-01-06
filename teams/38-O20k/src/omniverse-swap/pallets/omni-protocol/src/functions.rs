use crate::{MintTokenOp, OmniverseTokenProtocol, TokenOpcode, TransferTokenOp, MINT, TRANSFER};
use codec::Decode;
use sp_core::Hasher;
use sp_runtime::traits::Keccak256;
use sp_std::vec::Vec;

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
	} else if op_data.op == MINT {
		let mint_data = MintTokenOp::decode(&mut op_data.data.as_slice()).unwrap();
		bytes_data.extend_from_slice(&mut mint_data.to.clone());
		bytes_data.extend_from_slice(&mut u128::to_be_bytes(mint_data.amount).as_slice());
	}
	raw.append(&mut bytes_data.as_mut());

	let h = Keccak256::hash(raw.as_slice());

	h.0
}

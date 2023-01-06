use crate::{OmniverseTokenProtocol, VerifyError, VerifyResult};

pub trait OmniverseAccounts {
	fn verify_transaction(data: &OmniverseTokenProtocol) -> Result<VerifyResult, VerifyError>;
	fn get_transaction_count(pk: [u8; 64]) -> u128;
	fn is_malicious(pk: [u8; 64]) -> bool;
	fn get_chain_id() -> u8;
}

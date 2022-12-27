use ink_prelude::{
    string::String,
    vec::Vec,
};
use pink_web3::api::{Accounts, Eth, Namespace};
use pink_web3::contract::tokens::Tokenize;
use pink_web3::contract::{Contract, Options};
use pink_web3::signing::{keccak256, Key};
use pink_web3::transports::{resolve_ready, PinkHttp};

// Re-export these types so the caller can pass in arguments without pink_web3 includes
pub use pink_web3::keys::pink::KeyPair;
pub use pink_web3::types::{
    Address, Bytes, H256, Log, TransactionId, TransactionParameters, TransactionReceipt, U128, U256
};

#[derive(Debug, PartialEq)]
pub enum Error {
    BadSignature,
    ContractCallFailed,
    GasEstimateFailed,
    InvalidABI,
    ParseFailed,
    SendTransactionFailed,
    TransactionNotFound,
}

#[derive(Debug)]
pub struct ERC20Transfer {
    pub token: Address,
    pub from: Address,
    pub to: Address,
    pub amount: U256,
}

type Result<T> = core::result::Result<T, Error>;

// TODO: Eventually we should use estimate_gas to compute gas value. Currently leaving it out because I get a "no signer available" error

/*
 * Creates the TransactionParameters for a legacy Ethereum transaction.
 * Note that Accounts::sign_transaction will latter override None for the following params:
 * - `nonce`: the signing account's transaction count
 * - `gas_price`: estimated recommended gas price
 * https://docs.rs/pink-web3/latest/pink_web3/types/struct.TransactionParameters.html
 */ 
pub fn create_txn_params(to: Address, value: U256, data: Bytes, chain_id: u64) -> TransactionParameters {
    let mut tx = TransactionParameters::default();
    tx.to = Some(to);
    tx.value = value;
    tx.data = data;
    tx.chain_id = Some(chain_id);
    tx
}

pub fn send_txn(rpc_url: &str, key: &KeyPair, txn_params: TransactionParameters) -> Result<H256> {
    let signed = resolve_ready(accounts(rpc_url).sign_transaction(txn_params, key))
        .map_err(|_| Error::BadSignature)?;
    eth(rpc_url)
        .send_raw_transaction(signed.raw_transaction)
        .resolve().map_err(|_| Error::SendTransactionFailed)
}

pub fn parse_transfer_from_erc20_txn(rpc_url: &str, erc20_txn_hash: H256) -> Result<ERC20Transfer> {
    let receipt = get_txn_receipt(rpc_url, erc20_txn_hash)?;
    if receipt.logs.len() != 1 {
        return Err(Error::ParseFailed);
    }
    let transfer_log = ERC20Contract::parse_transfer_log(&receipt.logs[0])?;
    Ok(transfer_log)
}

pub fn parse_transfer_from_dex_swap_txn(rpc_url: &str, dex_swap_txn_hash: H256) -> Result<ERC20Transfer> {
    // Returns the final transfer in a series of swaps
    let receipt = get_txn_receipt(rpc_url, dex_swap_txn_hash)?;
    for i in (0..receipt.logs.len()).rev() {
        let transfer_log = ERC20Contract::parse_transfer_log(&receipt.logs[i]);
        if transfer_log.is_ok() {
            return transfer_log;
        }
    }
    Err(Error::ParseFailed)
}

pub fn get_txn_receipt(rpc_url: &str, txn_hash: H256) -> Result<TransactionReceipt> {
    eth(rpc_url)
        .transaction_receipt(txn_hash)
        .resolve()
        .map_err(|_| Error::TransactionNotFound)?
        .ok_or(Error::TransactionNotFound)
}

pub struct ERC20Contract {
    contract: Contract<PinkHttp>,
}

impl ERC20Contract {
    pub fn new(rpc_url: &str, contract_address: Address) -> Result<Self> {
        let contract = Contract::from_json(eth(rpc_url), contract_address, include_bytes!("../eth_abi/erc20_abi.json"))
            .map_err(|_| Error::InvalidABI)?;
        Ok(Self { contract: contract })
    }

    fn parse_transfer_log(log: &Log) -> Result<ERC20Transfer> {
        let topic = H256{0: keccak256("Transfer(address,address,uint256)".as_bytes())};
        if log.topics.len() != 3 || topic != log.topics[0] {
            return Err(Error::ParseFailed);
        }
        let x = ERC20Transfer{
            token: log.address.into(),
            from: log.topics[1].into(),
            to: log.topics[2].into(),
            amount: U256::from_big_endian(&log.data.0),
        };
        Ok(x)
    }

    pub fn name(&self) -> Result<String> {
        // block = BlockId::Number(BlockNumber::Latest) used in some tests
        let x = resolve_ready(
            self.contract
            .query("name", (), None, Options::default(), None)
        );
        // println!("Resolution: {:?}", x);
        x.map_err(|_| Error::ContractCallFailed)
    }

    pub fn decimals(&self) -> Result<u8> {
        let x = resolve_ready(
            self.contract
                .query("decimals", (), None, Options::default(), None)
        );
        // println!("Resolution: {:?}", x);
        x.map_err(|_| Error::ContractCallFailed)
    }

    pub fn balance_of(&self, who: Address) -> Result<U256> {
        let x = resolve_ready(
            self.contract
                .query("balanceOf", (who,), None, Options::default(), None)
        );
        // println!("Resolution: {:?}", x);
        x.map_err(|_| Error::ContractCallFailed)
    }

    pub fn transfer(&self, to: Address, amount: U256, key: &KeyPair) -> Result<H256> {
        let func = "transfer";
        let params = (to, amount);
        let options = estimate_gas(
            &self.contract,
            func,
            &params,
            key.address(),
            Options::default(),
        )?;

        let x = resolve_ready(
            self.contract.signed_call(func, params, options, key)
        );
        // println!("Resolution: {:?}", x);
        x.map_err(|_| Error::ContractCallFailed)
    }
}

pub struct DEXRouterContract {
    contract: Contract<PinkHttp>,
}

impl DEXRouterContract {
    pub fn new(rpc_url: &str, contract_address: Address) -> Result<Self> {
        let contract = Contract::from_json(eth(rpc_url), contract_address, include_bytes!("../eth_abi/dexrouter_abi.json"))
            .map_err(|_| Error::InvalidABI)?;
        Ok(Self { contract: contract })
    }

    pub fn factory(&self) -> Result<Address> {
        // block = BlockId::Number(BlockNumber::Latest) used in some tests
        let x = resolve_ready(
            self.contract
            .query("factory", (), None, Options::default(), None)
        );
        // println!("Resolution: {:?}", x);
        x.map_err(|_| Error::ContractCallFailed)
    }

    pub fn weth(&self) -> Result<Address> {
        let x = resolve_ready(
            self.contract
                .query("WETH", (), None, Options::default(), None)
        );
        // println!("Resolution: {:?}", x);
        x.map_err(|_| Error::ContractCallFailed)
    }

    pub fn quote(&self, amount_a: U256, reserve_a: U256, reserve_b: U256) -> Result<U256> {
        let x = resolve_ready(
            self.contract
                .query("quote", (amount_a, reserve_a, reserve_b,), None, Options::default(), None)
        );
        // println!("Resolution: {:?}", x);
        x.map_err(|_| Error::ContractCallFailed)
    }

    pub fn swap_exact_tokens_for_tokens(&self, amount_in: U256, amount_out_min: U256, path: Vec<Address>, to: Address, deadline: U256, key: &KeyPair) -> Result<H256> {
        let func = "swapExactTokensForTokens";
        let params = (amount_in, amount_out_min, path.clone(), to, deadline);
        let options = estimate_gas(
            &self.contract,
            func,
            &params,
            key.address(),
            Options::default(),
        )?;

        let x = resolve_ready(
            self.contract.signed_call(func, params, options, key)
        );
        // println!("Resolution: {:?}", x);
        x.map_err(|_| Error::ContractCallFailed)
    }

    pub fn swap_exact_eth_for_tokens(&self, amount_in: U256, amount_out_min: U256, path: Vec<Address>, to: Address, deadline: U256, key: &KeyPair) -> Result<H256> {
        let func = "swapExactETHForTokens";
        let params = (amount_out_min, path.clone(), to, deadline);
        let options = estimate_gas(
            &self.contract,
            func,
            &params,
            key.address(),
            Options::with(|options| options.value = Some(amount_in)),
        )?;
        
        let x = resolve_ready(
            self.contract.signed_call(func, params, options, key)
        );
        // println!("Resolution: {:?}", x);
        x.map_err(|_| Error::ContractCallFailed)
    }
}

fn eth(rpc_url: &str) -> Eth<PinkHttp> {
    Eth::new(PinkHttp::new(rpc_url.clone()))
}

fn accounts(rpc_url: &str) -> Accounts<PinkHttp> {
    Accounts::new(PinkHttp::new(rpc_url.clone()))
}

fn estimate_gas<T: Clone + Tokenize>(contract: &Contract<PinkHttp>, func: &str, params: &T, from: Address, options_seed: Options) -> Result<Options> {
    let gas = resolve_ready(
        contract.estimate_gas(
            func.clone(),
            params.clone(),
            from,
            options_seed.clone(),
        )
    ).map_err(|_| Error::GasEstimateFailed)?;
    let mut options = options_seed.clone();
    options.gas = Some(gas);
    Ok(options)
}

#[cfg(test)]
mod erc20_tests {
    use super::*;
    // use ink_lang as ink;
    use hex_literal::hex;

    fn get_contract() -> ERC20Contract {
        let rpc_url = "https://moonbeam.public.blastapi.io";
        let token_address = Address{0: hex!("FfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080")}; // xcDOT
        ERC20Contract::new(&rpc_url, token_address).expect("Invalid ABI")
    }
    
    #[test]
    fn erc20_name() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let name = get_contract().name().expect("Request failed");
        assert_eq!(name, "xcDOT");
    }

    #[test]
    fn erc20_decimals() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let decimals = get_contract().decimals().expect("Request failed");
        assert_eq!(decimals, 10);
    }

    #[test]
    fn erc20_balance_of() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let user = Address{0: hex!("c6e37086d09ec2048f151d11cdb9f9bbbdb7d685")};
        let balance = get_contract().balance_of(user).expect("Request failed");
        // println!("Balance: {:?}", balance);
        assert!(balance > U256::from(10000000000000000u64));
    }

    #[test]
    fn erc20_transfer() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let txn_hash = H256{0: hex!("ccedfd63a7f3e2c98e33ea1eebb4bf76ade3b607c8800e5cbbe6557a01549d61")};
        let rpc_url = "https://moonbeam.public.blastapi.io";
        let transfer = parse_transfer_from_erc20_txn(&rpc_url, txn_hash).expect("Parse failed");
        assert_eq!(transfer.token, Address{0: hex!("ffffffff1fcacbd218edc0eba20fc2308c778080")});
        assert_eq!(transfer.from, Address{0: hex!("fe86fc0cca9f7bb38e18322475c29f0cddb5104e")});
        assert_eq!(transfer.to, Address{0: hex!("e065662bf49f036756f5170edcd5cfca0a56f9a2")});
        assert_eq!(transfer.amount, U256::from(4000000000u64));
    }

    #[test]
    fn erc20_not_transfer() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let txn_hash = H256{0: hex!("d9ff564a3b27e41a9c59eabbec5f5564c3bf1c0bba9e54c595c3e916082ff3a8")};
        let rpc_url = "https://moonbeam.public.blastapi.io";
        let err = parse_transfer_from_erc20_txn(&rpc_url, txn_hash).expect_err("Transaction is not a transfer");
        assert_eq!(err, Error::ParseFailed);
    }

    #[test]
    fn erc20_invalid_txn() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let txn_hash = H256{0: hex!("a9ff564a3b27e41a9c59eabbec5f5564c3bf1c0bba9e54c595c3e916082ff3a8")};
        let rpc_url = "https://moonbeam.public.blastapi.io";
        let err = parse_transfer_from_erc20_txn(&rpc_url, txn_hash).expect_err("Transaction is not a transfer");
        assert_eq!(err, Error::TransactionNotFound);
    }
}

#[cfg(test)]
mod dexrouter_tests {
    use super::*;
    use hex_literal::hex;

    fn get_contract() -> DEXRouterContract {
        let rpc_url = "https://moonbeam.public.blastapi.io";
        let token_address = Address{0: hex!("70085a09D30D6f8C4ecF6eE10120d1847383BB57")}; // StellaSwap: Router v2.1
        DEXRouterContract::new(&rpc_url, token_address).expect("Invalid ABI")
    }
    
    #[test]
    fn dexrouter_factory() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let factory = get_contract().factory().expect("Request failed");
        assert_eq!(factory, Address{0: hex!("68a384d826d3678f78bb9fb1533c7e9577dacc0e")});
    }

    #[test]
    fn dexrouter_weth() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let weth = get_contract().weth().expect("Request failed");
        assert_eq!(weth, Address{0: hex!("acc15dc74880c9944775448304b263d191c6077f")});
    }

    #[test]
    fn dexrouter_quote() {
        pink_extension_runtime::mock_ext::mock_all_ext();
        let quote = get_contract().quote(100.into(), 1000.into(), 2000.into()).expect("Request failed");
        assert_eq!(quote, U256::from(200));
    }
}

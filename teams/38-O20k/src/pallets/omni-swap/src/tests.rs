use crate::mock::*;
use frame_support::assert_ok;
use secp256k1::{Secp256k1, Message, ecdsa::RecoverableSignature, SecretKey, PublicKey};
use omniverse_protocol_traits::{OmniverseTokenProtocol, TRANSFER, TokenOpcode, TransferTokenOp};
// use omniverse_token_traits::{OmniverseTokenFactoryHandler, FactoryError};
use codec::Encode;
use secp256k1::rand::rngs::OsRng;

const CHAIN_ID: u8 = 1;
const TOKEN_ID: Vec<u8> = Vec::<u8>::new();

fn get_sig_slice(sig: &RecoverableSignature) -> [u8; 65] {
  let (recovery_id, sig_slice) = sig.serialize_compact();
  let mut sig_recovery: [u8; 65] = [0; 65];
  sig_recovery[0..64].copy_from_slice(&sig_slice);
  sig_recovery[64] = recovery_id.to_i32() as u8;
  sig_recovery
}

fn encode_transfer(secp: &Secp256k1<secp256k1::All>, from: (SecretKey, PublicKey),
  to: PublicKey, amount: u128, nonce: u128) -> OmniverseTokenProtocol {
  let pk_from: [u8; 64] = from.1.serialize_uncompressed()[1..].try_into().expect("");
  let pk_to: [u8; 64] = to.serialize_uncompressed()[1..].try_into().expect("");
  let transfer_data = TransferTokenOp::new(pk_to, amount).encode();
  let data = TokenOpcode::new(TRANSFER, transfer_data).encode();
  let mut tx_data = OmniverseTokenProtocol::new(nonce, CHAIN_ID, pk_from, TOKEN_ID, data);
  let h = tx_data.get_raw_hash();
  let message = Message::from_slice(h.as_slice()).expect("messages must be 32 bytes and are expected to be hashes");
  let sig: RecoverableSignature = secp.sign_ecdsa_recoverable(&message, &from.0);
  let sig_recovery = get_sig_slice(&sig);
  tx_data.set_signature(sig_recovery);
  tx_data
}

#[test]
fn it_works_for_add_liquidity() {
  new_test_ext().execute_with(|| {
    let secp = Secp256k1::new();
    // Generate key pair
    let (secret_key, public_key) = secp.generate_keypair(&mut OsRng);

    // Get nonce
    // let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");
    let nonce = 0u128;

    let trading_pair = vec![1];
    let data_x = encode_transfer(&secp, (secret_key, public_key), public_key, 100, nonce);
    let data_y = encode_transfer(&secp, (secret_key, public_key), public_key, 1, nonce);
    assert_ok!(OmniSwap::add_liquidity(RuntimeOrigin::signed(1), trading_pair.clone(), 100, 1, 100, 1, vec![1], data_x.clone(), vec![2], data_y), ());
    assert_eq!(OmniSwap::trading_pairs(trading_pair.clone()), Some((100, 1)));
    assert_eq!(OmniSwap::total_liquidity(trading_pair.clone()), Some(9000));
    assert_eq!(OmniSwap::liquidity((trading_pair.clone(), data_x.from)), Some(9000));
  });
}

#[test]
fn it_works_for_remove_liquidity() {
  new_test_ext().execute_with(|| {
    let secp = Secp256k1::new();
    // Generate key pair
    let (secret_key, public_key) = secp.generate_keypair(&mut OsRng);

    // Get nonce
    // let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");
    let nonce = 0u128;

    let trading_pair = vec![1];
    let data_x = encode_transfer(&secp, (secret_key, public_key), public_key, 100, nonce);
    let data_y = encode_transfer(&secp, (secret_key, public_key), public_key, 1, nonce);
    assert_ok!(OmniSwap::add_liquidity(RuntimeOrigin::signed(1), trading_pair.clone(), 100, 1, 100, 1, vec![1], data_x.clone(), vec![2], data_y), ());
    assert_eq!(OmniSwap::trading_pairs(trading_pair.clone()), Some((100, 1)));
    assert_eq!(OmniSwap::total_liquidity(trading_pair.clone()), Some(9000));
    assert_eq!(OmniSwap::liquidity((trading_pair.clone(), data_x.from)), Some(9000));

    assert_ok!(OmniSwap::remove_liquidity(RuntimeOrigin::signed(1), trading_pair.clone(), data_x.from, 9000, 100, 1));
    assert_eq!(OmniSwap::trading_pairs(trading_pair.clone()), Some((0, 0)));
    assert_eq!(OmniSwap::total_liquidity(trading_pair.clone()), Some(0));
    assert_eq!(OmniSwap::liquidity((trading_pair.clone(), data_x.from)), Some(0));
  });
}

#[test]
fn it_works_for_swap_x2y() {
  new_test_ext().execute_with(|| {
    let secp = Secp256k1::new();
    // Generate key pair
    let (secret_key, public_key) = secp.generate_keypair(&mut OsRng);

    // Get nonce
    // let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");
    let nonce = 0u128;

    let trading_pair = vec![1];
    let data_x = encode_transfer(&secp, (secret_key, public_key), public_key, 1000000, nonce);
    let data_y = encode_transfer(&secp, (secret_key, public_key), public_key, 10000, nonce);
    assert_ok!(OmniSwap::add_liquidity(RuntimeOrigin::signed(1), trading_pair.clone(), 1000000, 10000, 100, 1, vec![1], data_x.clone(), vec![2], data_y), ());

    assert_ok!(OmniSwap::swap_x2y(RuntimeOrigin::signed(1), trading_pair.clone(), 1000, 1, vec![1], data_x.clone()), ());

    // println!("{:?}", OmniSwap::trading_pairs(trading_pair.clone()));
    // println!("{:?}", OmniSwap::balance((trading_pair.clone(), 1)));
    
    assert_eq!(OmniSwap::trading_pairs(trading_pair.clone()), Some((1001000, 9991)));
    assert_eq!(OmniSwap::balance((trading_pair.clone(), data_x.from)), Some((0, 9)));
  });
}

#[test]
fn it_works_for_swap_y2x() {
  new_test_ext().execute_with(|| {
    let secp = Secp256k1::new();
    // Generate key pair
    let (secret_key, public_key) = secp.generate_keypair(&mut OsRng);

    // Get nonce
    // let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");
    let nonce = 0u128;

    let trading_pair = vec![1];
    let data_x = encode_transfer(&secp, (secret_key, public_key), public_key, 1000000, nonce);
    let data_y = encode_transfer(&secp, (secret_key, public_key), public_key, 10000, nonce);
    assert_ok!(OmniSwap::add_liquidity(RuntimeOrigin::signed(1), trading_pair.clone(), 1000000, 10000, 100, 1, vec![1], data_x.clone(), vec![2], data_y.clone()), ());

    assert_ok!(OmniSwap::swap_y2x(RuntimeOrigin::signed(1), trading_pair.clone(), 10, 999, vec![2], data_y), ());

    // println!("{:?}", OmniSwap::trading_pairs(trading_pair.clone()));
    // println!("{:?}", OmniSwap::balance((trading_pair.clone(), 1)));
    
    assert_eq!(OmniSwap::trading_pairs(trading_pair.clone()), Some((999001, 10010)));
    assert_eq!(OmniSwap::balance((trading_pair.clone(), data_x.from)), Some((999, 0)));
  });
}

use crate::{mock::*, Error};
use frame_support::{assert_noop, assert_ok, assert_err};
use omniverse_protocol_traits::{OmniverseAccounts, OmniverseTokenProtocol, VerifyResult, VerifyError, TokenOpcode, TransferTokenOp, MintTokenOp, TRANSFER, MINT, get_transaction_hash};
use omniverse_token_traits::{OmniverseTokenFactoryHandler, FactoryError};
use sha3::{Digest, Keccak256};
use secp256k1::rand::rngs::OsRng;
use secp256k1::{Secp256k1, Message, ecdsa::RecoverableSignature, SecretKey, PublicKey};
use codec::{Encode, Decode};

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

fn encode_mint(secp: &Secp256k1<secp256k1::All>, from: (SecretKey, PublicKey),
    to: PublicKey, amount: u128, nonce: u128) -> OmniverseTokenProtocol {
    let pk_from: [u8; 64] = from.1.serialize_uncompressed()[1..].try_into().expect("");
    let pk_to: [u8; 64] = to.serialize_uncompressed()[1..].try_into().expect("");
    let transfer_data = MintTokenOp::new(pk_to, amount).encode();
    let data = TokenOpcode::new(MINT, transfer_data).encode();
    let mut tx_data = OmniverseTokenProtocol::new(nonce, CHAIN_ID, pk_from, TOKEN_ID, data);
    let h = tx_data.get_raw_hash();
    let message = Message::from_slice(h.as_slice()).expect("messages must be 32 bytes and are expected to be hashes");
    let sig: RecoverableSignature = secp.sign_ecdsa_recoverable(&message, &from.0);
    let sig_recovery = get_sig_slice(&sig);
    tx_data.set_signature(sig_recovery);
    tx_data
}

// #[test]
// fn it_works_for_decode() {
//     new_test_ext().execute_with(|| {
//         let data = [
//             3,  65,   1, 123, 189, 136, 115, 207, 195,  13,  61, 222,
//           226, 167, 169, 220, 210, 181, 179, 153, 184,  93, 171, 135,
//           192,  17, 173,  75, 233, 111, 230, 150,  37,  67,  14,  63,
//            19, 148, 114,   7, 255,  78,  89,  91,  67, 238, 127,  43,
//           205, 103, 208, 179,  37,  39,  55,  40, 111, 234, 152, 103,
//           135, 234,  57, 187, 219, 106, 181, 100,   0,   0,   0,   0,
//             0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0
//         ];

//         let token_op = TokenOpcode::decode(&mut data.as_slice()).unwrap();
//         println!("{:?}", token_op);
//         let mint_op = MintTokenOp::decode(&mut token_op.data.as_slice());
//         println!("{:?}", mint_op);
//     });
// }

#[test]
fn it_works_for_create_token() {
    new_test_ext().execute_with(|| {
        assert_ok!(OmniverseFactory::create_token(RuntimeOrigin::signed(1), [0; 64], vec![1], None));
        assert!(OmniverseFactory::tokens_info(vec![1]).is_some());
    });
}

#[test]
fn it_fails_for_create_token_with_token_already_exist() {
    new_test_ext().execute_with(|| {
        assert_ok!(OmniverseFactory::create_token(RuntimeOrigin::signed(1), [0; 64], vec![1], None));
        assert_err!(OmniverseFactory::create_token(RuntimeOrigin::signed(1), [0; 64], vec![1], None), Error::<Test>::TokenAlreadyExist);
    });
}

#[test]
fn it_fails_for_set_members_with_token_not_exist() {
    new_test_ext().execute_with(|| {
        assert_err!(OmniverseFactory::set_members(RuntimeOrigin::signed(1), vec![1], vec![1]), Error::<Test>::TokenNotExist);
    });
}

#[test]
fn it_fails_for_set_members_with_not_owner() {
    new_test_ext().execute_with(|| {
        assert_ok!(OmniverseFactory::create_token(RuntimeOrigin::signed(1), [0; 64], vec![1], None));
        assert_err!(OmniverseFactory::set_members(RuntimeOrigin::signed(2), vec![1], vec![1]), Error::<Test>::NotOwner);
    });
}

#[test]
fn it_works_for_set_members() {
    new_test_ext().execute_with(|| {
        assert_ok!(OmniverseFactory::create_token(RuntimeOrigin::signed(1), [0; 64], vec![1], None));
        assert_ok!(OmniverseFactory::set_members(RuntimeOrigin::signed(1), vec![1], vec![1]));
        let token_info = OmniverseFactory::tokens_info(vec![1]).unwrap();
        assert!(token_info.members == vec![1]);
    });
}

#[test]
fn it_fails_for_factory_handler_with_token_not_exist() {
    new_test_ext().execute_with(|| {
        let secp = Secp256k1::new();
        // Generate key pair
        let (secret_key, public_key) = secp.generate_keypair(&mut OsRng);

        // Get nonce
        let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");
        let nonce = OmniverseProtocol::get_transaction_count(pk);

        let data = encode_transfer(&secp, (secret_key, public_key), public_key, 1, nonce);
        assert_err!(OmniverseFactory::send_transaction_external(vec![1], &data), FactoryError::TokenNotExist);
    });
}

#[test]
fn it_fails_for_factory_handler_with_wrong_destination() {
    new_test_ext().execute_with(|| {
        let secp = Secp256k1::new();
        // Generate key pair
        let (secret_key, public_key) = secp.generate_keypair(&mut OsRng);

        // Get nonce
        let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");
        let nonce = OmniverseProtocol::get_transaction_count(pk);
        
        // Create token
        assert_ok!(OmniverseFactory::create_token(RuntimeOrigin::signed(1), pk, vec![1], None));

        let (_, public_key_to) = secp.generate_keypair(&mut OsRng);
        let data = encode_transfer(&secp, (secret_key, public_key), public_key_to, 1, nonce);
        assert_err!(OmniverseFactory::send_transaction_external(vec![1], &data), FactoryError::WrongDestination);
    });
}

#[test]
fn it_fails_for_factory_handler_with_signature_error() {
    new_test_ext().execute_with(|| {
        let secp = Secp256k1::new();
        // Generate key pair
        let (secret_key, public_key) = secp.generate_keypair(&mut OsRng);

        // Get nonce
        let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");
        let nonce = OmniverseProtocol::get_transaction_count(pk);
        
        // Create token
        assert_ok!(OmniverseFactory::create_token(RuntimeOrigin::signed(1), pk, TOKEN_ID, None));

        let (_, public_key_to) = secp.generate_keypair(&mut OsRng);
        let mut data = encode_transfer(&secp, (secret_key, public_key), public_key_to, 1, nonce);
        data.signature = [0; 65];
        assert_err!(OmniverseFactory::send_transaction_external(TOKEN_ID, &data), FactoryError::ProtocolSignatureError);
    });
}

#[test]
fn it_fails_for_factory_handler_mint_with_signer_not_owner() {
    new_test_ext().execute_with(|| {
        let secp = Secp256k1::new();
        // Generate key pair
        let (_, public_key) = secp.generate_keypair(&mut OsRng);

        // Get nonce
        let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");
        let nonce = OmniverseProtocol::get_transaction_count(pk);
        
        // Create token
        assert_ok!(OmniverseFactory::create_token(RuntimeOrigin::signed(1), pk, TOKEN_ID, None));

        let (secret_key_to, public_key_to) = secp.generate_keypair(&mut OsRng);
        let data = encode_mint(&secp, (secret_key_to, public_key_to), public_key_to, 1, nonce);
        assert_err!(OmniverseFactory::send_transaction_external(TOKEN_ID, &data), FactoryError::SignerNotOwner);
    });
}

#[test]
fn it_works_for_factory_handler_mint() {
    new_test_ext().execute_with(|| {
        let secp = Secp256k1::new();
        // Generate key pair
        let (secret_key, public_key) = secp.generate_keypair(&mut OsRng);

        // Get nonce
        let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");
        let nonce = OmniverseProtocol::get_transaction_count(pk);
        
        // Create token
        assert_ok!(OmniverseFactory::create_token(RuntimeOrigin::signed(1), pk, TOKEN_ID, None));

        let (_, public_key_to) = secp.generate_keypair(&mut OsRng);
        let data = encode_mint(&secp, (secret_key, public_key), public_key_to, 1, nonce);
        assert_ok!(OmniverseFactory::send_transaction_external(TOKEN_ID, &data));

        let pk_to: [u8; 64] = public_key_to.serialize_uncompressed()[1..].try_into().expect("");
        let token = OmniverseFactory::tokens(TOKEN_ID, pk_to);
        assert_eq!(token, 1);
    });
}

#[test]
fn it_fails_for_factory_handler_transfer_with_balance_overflow() {
    new_test_ext().execute_with(|| {
        let secp = Secp256k1::new();
        // Generate key pair
        let (secret_key, public_key) = secp.generate_keypair(&mut OsRng);

        // Get nonce
        let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");
        let nonce = OmniverseProtocol::get_transaction_count(pk);

        // Create token
        assert_ok!(OmniverseFactory::create_token(RuntimeOrigin::signed(1), pk, TOKEN_ID, None));

        let (_, public_key_to) = secp.generate_keypair(&mut OsRng);
        let data = encode_transfer(&secp, (secret_key, public_key), public_key_to, 1, nonce);
        assert_err!(OmniverseFactory::send_transaction_external(TOKEN_ID, &data), FactoryError::BalanceOverflow);
    });
}

#[test]
fn it_works_for_factory_handler_transfer() {
    new_test_ext().execute_with(|| {
        let secp = Secp256k1::new();
        // Generate key pair
        let (secret_key, public_key) = secp.generate_keypair(&mut OsRng);

        // Get nonce
        let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");
        let nonce = OmniverseProtocol::get_transaction_count(pk);

        // Create token
        assert_ok!(OmniverseFactory::create_token(RuntimeOrigin::signed(1), pk, TOKEN_ID, None));

        // Mint token
        let mint_data = encode_mint(&secp, (secret_key, public_key), public_key, 10, nonce);
        assert_ok!(OmniverseFactory::send_transaction_external(TOKEN_ID, &mint_data));

        let (_, public_key_to) = secp.generate_keypair(&mut OsRng);
        let data = encode_transfer(&secp, (secret_key, public_key), public_key_to, 1, nonce);
        assert_ok!(OmniverseFactory::send_transaction_external(TOKEN_ID, &data));

        assert_eq!(OmniverseFactory::tokens(TOKEN_ID, &pk), 9);
        let pk_to: [u8; 64] = public_key_to.serialize_uncompressed()[1..].try_into().expect("");
        assert_eq!(OmniverseFactory::tokens(TOKEN_ID, &pk_to), 1);
    });
}
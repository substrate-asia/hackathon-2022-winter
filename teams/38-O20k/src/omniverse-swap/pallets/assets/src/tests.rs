// This file is part of Substrate.

// Copyright (C) 2019-2022 Parity Technologies (UK) Ltd.
// SPDX-License-Identifier: Apache-2.0

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// 	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//! Tests for Assets pallet.

use super::traits::OmniverseTokenFactoryHandler;
use super::*;
use crate::{mock::*, Error};
use codec::{Decode, Encode};
use frame_support::{assert_err, assert_noop, assert_ok, traits::Currency};
use pallet_balances::Error as BalancesError;
use pallet_omniverse_protocol::{
	traits::OmniverseAccounts, MintTokenOp, OmniverseTokenProtocol, TokenOpcode, TransferTokenOp,
	MINT, TRANSFER,
};
use secp256k1::rand::rngs::OsRng;
use secp256k1::{ecdsa::RecoverableSignature, Message, PublicKey, Secp256k1, SecretKey};
use sp_core::Hasher;
use sp_runtime::traits::BlakeTwo256;

#[test]
fn minting_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(Assets::mint(RuntimeOrigin::signed(1), 0, 1, 100), Error::<Test>::Unsupport);
	});
}

#[test]
fn creating_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(Assets::create(RuntimeOrigin::signed(1), 0, 1, 1), Error::<Test>::Unsupport);
	});
}

#[test]
fn force_creating_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(
			Assets::force_create(RuntimeOrigin::root(), 0, 1, false, 1),
			Error::<Test>::Unsupport
		);
	});
}

#[test]
fn destroying_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(
			Assets::destroy(
				RuntimeOrigin::signed(1),
				0,
				DestroyWitness { accounts: 0, sufficients: 0, approvals: 0 }
			),
			Error::<Test>::Unsupport
		);
	});
}

#[test]
fn burning_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(Assets::burn(RuntimeOrigin::signed(1), 0, 1, 91), Error::<Test>::Unsupport);
	});
}

#[test]
fn transferring_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(
			Assets::transfer(RuntimeOrigin::signed(1), 0, 1, 91),
			Error::<Test>::Unsupport
		);
	});
}

#[test]
fn transferring_keep_alive_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(
			Assets::transfer_keep_alive(RuntimeOrigin::signed(1), 0, 1, 91),
			Error::<Test>::Unsupport
		);
	});
}

#[test]
fn force_transferring_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(
			Assets::force_transfer(RuntimeOrigin::signed(1), 0, 1, 2, 91),
			Error::<Test>::Unsupport
		);
	});
}

#[test]
fn freezing_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(Assets::freeze(RuntimeOrigin::signed(1), 0, 1), Error::<Test>::Unsupport);
	});
}

#[test]
fn thawing_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(Assets::thaw(RuntimeOrigin::signed(1), 0, 1), Error::<Test>::Unsupport);
	});
}

#[test]
fn freezing_asset_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(Assets::freeze_asset(RuntimeOrigin::signed(1), 0), Error::<Test>::Unsupport);
	});
}

#[test]
fn thawing_asset_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(Assets::thaw_asset(RuntimeOrigin::signed(1), 0), Error::<Test>::Unsupport);
	});
}

#[test]
fn transferring_ownership_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(
			Assets::transfer_ownership(RuntimeOrigin::signed(1), 0, 1),
			Error::<Test>::Unsupport
		);
	});
}

#[test]
fn setting_team_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(
			Assets::set_team(RuntimeOrigin::signed(1), 0, 1, 2, 91),
			Error::<Test>::Unsupport
		);
	});
}

#[test]
fn force_asset_status_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(
			Assets::force_asset_status(RuntimeOrigin::signed(1), 0, 1, 2, 2, 2, 10, false, false),
			Error::<Test>::Unsupport
		);
	});
}

#[test]
fn approving_transfer_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(
			Assets::approve_transfer(RuntimeOrigin::signed(1), 0, 1, 91),
			Error::<Test>::Unsupport
		);
	});
}

#[test]
fn canceling_approval_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(
			Assets::cancel_approval(RuntimeOrigin::signed(1), 0, 1),
			Error::<Test>::Unsupport
		);
	});
}

#[test]
fn force_setting_team_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(
			Assets::force_cancel_approval(RuntimeOrigin::signed(1), 0, 1, 2),
			Error::<Test>::Unsupport
		);
	});
}

#[test]
fn transferring_approved_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(
			Assets::transfer_approved(RuntimeOrigin::signed(1), 0, 1, 2, 91),
			Error::<Test>::Unsupport
		);
	});
}

#[test]
fn touching_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(Assets::touch(RuntimeOrigin::signed(1), 0), Error::<Test>::Unsupport);
	});
}

#[test]
fn refunding_should_fail() {
	new_test_ext().execute_with(|| {
		assert_noop!(Assets::refund(RuntimeOrigin::signed(1), 0, false), Error::<Test>::Unsupport);
	});
}

#[test]
fn set_metadata_should_work() {
	new_test_ext().execute_with(|| {
		// Cannot add metadata to unknown asset
		assert_noop!(
			Assets::set_metadata(RuntimeOrigin::signed(1), 0, vec![0u8; 10], vec![0u8; 10], 12),
			Error::<Test>::Unknown,
		);

		let secp = Secp256k1::new();
		// Generate key pair
		let (_, public_key) = secp.generate_keypair(&mut OsRng);
		let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");

		let account = get_account_id_from_pk(public_key.serialize().as_slice());
		fund_account(account);
		assert_ok!(Assets::create_token(RuntimeOrigin::signed(1), pk, vec![1], None));

		// Cannot add metadata to unowned asset
		assert_noop!(
			Assets::set_metadata(RuntimeOrigin::signed(2), 0, vec![0u8; 10], vec![0u8; 10], 12),
			Error::<Test>::NoPermission,
		);

		// Cannot add oversized metadata
		assert_noop!(
			Assets::set_metadata(RuntimeOrigin::signed(1), 0, vec![0u8; 100], vec![0u8; 10], 12),
			Error::<Test>::BadMetadata,
		);
		assert_noop!(
			Assets::set_metadata(RuntimeOrigin::signed(1), 0, vec![0u8; 10], vec![0u8; 100], 12),
			Error::<Test>::BadMetadata,
		);

		// Successfully add metadata and take deposit
		Balances::make_free_balance_be(&account, 30);
		assert_ok!(Assets::set_metadata(
			RuntimeOrigin::signed(account),
			0,
			vec![0u8; 10],
			vec![0u8; 10],
			12
		));
		assert_eq!(Balances::free_balance(&account), 9);

		// Update deposit
		assert_ok!(Assets::set_metadata(
			RuntimeOrigin::signed(account),
			0,
			vec![0u8; 10],
			vec![0u8; 5],
			12
		));
		assert_eq!(Balances::free_balance(&account), 14);
		assert_ok!(Assets::set_metadata(
			RuntimeOrigin::signed(account),
			0,
			vec![0u8; 10],
			vec![0u8; 15],
			12
		));
		assert_eq!(Balances::free_balance(&account), 4);

		// Cannot over-reserve
		assert_noop!(
			Assets::set_metadata(RuntimeOrigin::signed(account), 0, vec![0u8; 20], vec![0u8; 20], 12),
			BalancesError::<Test, _>::InsufficientBalance,
		);

		// Clear Metadata
		assert!(Metadata::<Test>::contains_key(0));
		assert_noop!(
			Assets::clear_metadata(RuntimeOrigin::signed(2), 0),
			Error::<Test>::NoPermission
		);
		assert_noop!(Assets::clear_metadata(RuntimeOrigin::signed(account), 1), Error::<Test>::Unknown);
		assert_ok!(Assets::clear_metadata(RuntimeOrigin::signed(account), 0));
		assert!(!Metadata::<Test>::contains_key(0));
	});
}

#[test]
fn force_metadata_should_work() {
	new_test_ext().execute_with(|| {
		// force set metadata works
		let secp = Secp256k1::new();
		// Generate key pair
		let (_, public_key) = secp.generate_keypair(&mut OsRng);
		let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");

		let account = get_account_id_from_pk(public_key.serialize().as_slice());
		fund_account(account);
		assert_ok!(Assets::create_token(RuntimeOrigin::signed(1), pk, vec![1], None));
		
		assert_ok!(Assets::force_set_metadata(
			RuntimeOrigin::root(),
			0,
			vec![0u8; 10],
			vec![0u8; 10],
			8,
			false
		));
		assert!(Metadata::<Test>::contains_key(0));

		// overwrites existing metadata
		let asset_original_metadata = Metadata::<Test>::get(0);
		assert_ok!(Assets::force_set_metadata(
			RuntimeOrigin::root(),
			0,
			vec![1u8; 10],
			vec![1u8; 10],
			8,
			false
		));
		assert_ne!(Metadata::<Test>::get(0), asset_original_metadata);

		// attempt to set metadata for non-existent asset class
		assert_noop!(
			Assets::force_set_metadata(
				RuntimeOrigin::root(),
				1,
				vec![0u8; 10],
				vec![0u8; 10],
				8,
				false
			),
			Error::<Test>::Unknown
		);

		// string length limit check
		let limit = 50usize;
		assert_noop!(
			Assets::force_set_metadata(
				RuntimeOrigin::root(),
				0,
				vec![0u8; limit + 1],
				vec![0u8; 10],
				8,
				false
			),
			Error::<Test>::BadMetadata
		);
		assert_noop!(
			Assets::force_set_metadata(
				RuntimeOrigin::root(),
				0,
				vec![0u8; 10],
				vec![0u8; limit + 1],
				8,
				false
			),
			Error::<Test>::BadMetadata
		);

		// force clear metadata works
		assert!(Metadata::<Test>::contains_key(0));
		assert_ok!(Assets::force_clear_metadata(RuntimeOrigin::root(), 0));
		assert!(!Metadata::<Test>::contains_key(0));

		// Error handles clearing non-existent asset class
		assert_noop!(
			Assets::force_clear_metadata(RuntimeOrigin::root(), 1),
			Error::<Test>::Unknown
		);
	});
}

// tests of omniverse tokens
const CHAIN_ID: u8 = 1;
const TOKEN_ID: Vec<u8> = Vec::<u8>::new();

fn get_account_id_from_pk(pk: &[u8]) -> <Test as frame_system::Config>::AccountId {
	let hash = BlakeTwo256::hash(pk);
	let dest = <Test as frame_system::Config>::AccountId::decode(&mut &hash[..]).unwrap();
	dest
}

fn fund_account(account: <Test as frame_system::Config>::AccountId) {
	assert_ok!(Balances::transfer(RuntimeOrigin::signed(1), account, 100));
}

fn get_sig_slice(sig: &RecoverableSignature) -> [u8; 65] {
	let (recovery_id, sig_slice) = sig.serialize_compact();
	let mut sig_recovery: [u8; 65] = [0; 65];
	sig_recovery[0..64].copy_from_slice(&sig_slice);
	sig_recovery[64] = recovery_id.to_i32() as u8;
	sig_recovery
}

fn encode_transfer(
	secp: &Secp256k1<secp256k1::All>,
	from: (SecretKey, PublicKey),
	to: PublicKey,
	amount: u128,
	nonce: u128,
) -> OmniverseTokenProtocol {
	let pk_from: [u8; 64] = from.1.serialize_uncompressed()[1..].try_into().expect("");
	let pk_to: [u8; 64] = to.serialize_uncompressed()[1..].try_into().expect("");
	let transfer_data = TransferTokenOp::new(pk_to, amount).encode();
	let data = TokenOpcode::new(TRANSFER, transfer_data).encode();
	let mut tx_data = OmniverseTokenProtocol::new(nonce, CHAIN_ID, pk_from, TOKEN_ID, data);
	let h = tx_data.get_raw_hash();
	let message = Message::from_slice(h.as_slice())
		.expect("messages must be 32 bytes and are expected to be hashes");
	let sig: RecoverableSignature = secp.sign_ecdsa_recoverable(&message, &from.0);
	let sig_recovery = get_sig_slice(&sig);
	tx_data.set_signature(sig_recovery);
	tx_data
}

fn encode_mint(
	secp: &Secp256k1<secp256k1::All>,
	from: (SecretKey, PublicKey),
	to: PublicKey,
	amount: u128,
	nonce: u128,
) -> OmniverseTokenProtocol {
	let pk_from: [u8; 64] = from.1.serialize_uncompressed()[1..].try_into().expect("");
	let pk_to: [u8; 64] = to.serialize_uncompressed()[1..].try_into().expect("");
	let transfer_data = MintTokenOp::new(pk_to, amount).encode();
	let data = TokenOpcode::new(MINT, transfer_data).encode();
	let mut tx_data = OmniverseTokenProtocol::new(nonce, CHAIN_ID, pk_from, TOKEN_ID, data);
	let h = tx_data.get_raw_hash();
	let message = Message::from_slice(h.as_slice())
		.expect("messages must be 32 bytes and are expected to be hashes");
	let sig: RecoverableSignature = secp.sign_ecdsa_recoverable(&message, &from.0);
	let sig_recovery = get_sig_slice(&sig);
	tx_data.set_signature(sig_recovery);
	tx_data
}

#[test]
fn it_works_for_decode() {
	new_test_ext().execute_with(|| {
		let data = [
			3, 65, 1, 123, 189, 136, 115, 207, 195, 13, 61, 222, 226, 167, 169, 220, 210, 181, 179,
			153, 184, 93, 171, 135, 192, 17, 173, 75, 233, 111, 230, 150, 37, 67, 14, 63, 19, 148,
			114, 7, 255, 78, 89, 91, 67, 238, 127, 43, 205, 103, 208, 179, 37, 39, 55, 40, 111,
			234, 152, 103, 135, 234, 57, 187, 219, 106, 181, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0,
		];

		let token_op = TokenOpcode::decode(&mut data.as_slice()).unwrap();
		println!("{:?}", token_op);
		let mint_op = MintTokenOp::decode(&mut token_op.data.as_slice());
		println!("{:?}", mint_op);
	});
}

#[test]
fn it_works_for_create_token() {
	new_test_ext().execute_with(|| {
		let secp = Secp256k1::new();
		// Generate key pair
		let (_, public_key) = secp.generate_keypair(&mut OsRng);
		let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");

		let account = get_account_id_from_pk(public_key.serialize().as_slice());
		fund_account(account);
		assert_ok!(Assets::create_token(RuntimeOrigin::signed(1), pk, vec![1], None));
		assert!(Assets::tokens_info(vec![1]).is_some());
	});
}

#[test]
fn it_fails_for_create_token_with_token_already_exist() {
	new_test_ext().execute_with(|| {
		let secp = Secp256k1::new();
		// Generate key pair
		let (_, public_key) = secp.generate_keypair(&mut OsRng);
		let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");

		let account = get_account_id_from_pk(public_key.serialize().as_slice());
		fund_account(account);
		assert_ok!(Assets::create_token(RuntimeOrigin::signed(1), pk.clone(), vec![1], None));
		assert_err!(
			Assets::create_token(RuntimeOrigin::signed(1), pk, vec![1], None),
			Error::<Test>::InUse
		);
	});
}

#[test]
fn it_fails_for_set_members_with_token_not_exist() {
	new_test_ext().execute_with(|| {
		assert_err!(
			Assets::set_members(RuntimeOrigin::signed(1), vec![1], vec![1]),
			Error::<Test>::Unknown
		);
	});
}

#[test]
fn it_fails_for_set_members_with_not_owner() {
	new_test_ext().execute_with(|| {
		// assert_ok!(Assets::create_token(RuntimeOrigin::signed(1), pk, vec![1], None));
		// assert_err!(Assets::set_members(RuntimeOrigin::signed(2), vec![1], vec![1]), Error::<Test>::SignerNotOwner);
	});
}

#[test]
fn it_works_for_set_members() {
	new_test_ext().execute_with(|| {
		let secp = Secp256k1::new();
		// Generate key pair
		let (_, public_key) = secp.generate_keypair(&mut OsRng);
		let pk: [u8; 64] = public_key.serialize_uncompressed()[1..].try_into().expect("");
		let account = get_account_id_from_pk(public_key.serialize().as_slice());
		fund_account(account);
		assert_ok!(Assets::create_token(RuntimeOrigin::signed(1), pk, vec![1], None));
		assert_ok!(Assets::set_members(RuntimeOrigin::signed(1), vec![1], vec![1]));
		let token_info = Assets::tokens_info(vec![1]).unwrap();
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
		assert_err!(Assets::send_transaction_external(vec![1], &data), Error::<Test>::Unknown);
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
		let account = get_account_id_from_pk(public_key.serialize().as_slice());
		fund_account(account);
		assert_ok!(Assets::create_token(RuntimeOrigin::signed(1), pk, vec![1], None));

		let (_, public_key_to) = secp.generate_keypair(&mut OsRng);
		let data = encode_transfer(&secp, (secret_key, public_key), public_key_to, 1, nonce);
		assert_err!(
			Assets::send_transaction_external(vec![1], &data),
			Error::<Test>::WrongDestination
		);
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
		let account = get_account_id_from_pk(public_key.serialize().as_slice());
		fund_account(account);
		assert_ok!(Assets::create_token(RuntimeOrigin::signed(1), pk, TOKEN_ID, None));

		let (_, public_key_to) = secp.generate_keypair(&mut OsRng);
		let mut data = encode_transfer(&secp, (secret_key, public_key), public_key_to, 1, nonce);
		data.signature = [0; 65];
		assert_err!(
			Assets::send_transaction_external(TOKEN_ID, &data),
			Error::<Test>::ProtocolSignatureError
		);
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
		let account = get_account_id_from_pk(public_key.serialize().as_slice());
		fund_account(account);
		assert_ok!(Assets::create_token(RuntimeOrigin::signed(1), pk, TOKEN_ID, None));

		let (secret_key_to, public_key_to) = secp.generate_keypair(&mut OsRng);
		let data = encode_mint(&secp, (secret_key_to, public_key_to), public_key_to, 1, nonce);
		assert_err!(
			Assets::send_transaction_external(TOKEN_ID, &data),
			Error::<Test>::SignerNotOwner
		);
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
		let account = get_account_id_from_pk(public_key.serialize().as_slice());
		fund_account(account);
		assert_ok!(Assets::create_token(RuntimeOrigin::signed(1), pk, TOKEN_ID, None));

		let (_, public_key_to) = secp.generate_keypair(&mut OsRng);
		let account_to = get_account_id_from_pk(public_key_to.serialize().as_slice());
		fund_account(account_to);
		let data = encode_mint(&secp, (secret_key, public_key), public_key_to, 1, nonce);
		assert_ok!(Assets::send_transaction_external(TOKEN_ID, &data));

		let pk_to: [u8; 64] = public_key_to.serialize_uncompressed()[1..].try_into().expect("");
		let token = Assets::tokens(TOKEN_ID, pk_to);
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
		let account = get_account_id_from_pk(public_key.serialize().as_slice());
		fund_account(account);
		assert_ok!(Assets::create_token(RuntimeOrigin::signed(1), pk, TOKEN_ID, None));

		let (_, public_key_to) = secp.generate_keypair(&mut OsRng);
		let data = encode_transfer(&secp, (secret_key, public_key), public_key_to, 1, nonce);
		assert_err!(Assets::send_transaction_external(TOKEN_ID, &data), Error::<Test>::BalanceLow);
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
		let account = get_account_id_from_pk(public_key.serialize().as_slice());
		fund_account(account);
		assert_ok!(Assets::create_token(RuntimeOrigin::signed(1), pk, TOKEN_ID, None));

		// Mint token
		let mint_data = encode_mint(&secp, (secret_key, public_key), public_key, 10, nonce);
		assert_ok!(Assets::send_transaction_external(TOKEN_ID, &mint_data));

		let (_, public_key_to) = secp.generate_keypair(&mut OsRng);
		let account_to = get_account_id_from_pk(public_key_to.serialize().as_slice());
		fund_account(account_to);
		let data = encode_transfer(&secp, (secret_key, public_key), public_key_to, 1, nonce);
		assert_ok!(Assets::send_transaction_external(TOKEN_ID, &data));

		assert_eq!(Assets::tokens(TOKEN_ID, &pk), 9);
		let pk_to: [u8; 64] = public_key_to.serialize_uncompressed()[1..].try_into().expect("");
		assert_eq!(Assets::tokens(TOKEN_ID, &pk_to), 1);
	});
}

use super::*;
use crate::{mock::*, Error};

use frame_support::{assert_noop, assert_ok};

use mock::RuntimeEvent as Event;
use sp_core::sr25519::Public;

#[test]
fn it_works_for_bind_address() {
	new_test_ext().execute_with(|| {
		let signer = Public::from_raw([0; 32]);
		let pmail_address: BoundedVec<u8, ConstU32<128>> = vec![1, 2, 3].try_into().unwrap();

		// assert
		assert_ok!(MailModule::bind_address(RuntimeOrigin::signed(signer), pmail_address.clone()));

		// assert transfer limit owner
		assert_eq!(MailMap::<Test>::get(signer), Some(pmail_address.clone()));
		assert_eq!(OwnerMap::<Test>::get(pmail_address.clone()), Some(signer));

		// assert successful events
		System::assert_has_event(Event::MailModule(crate::Event::AddressBound(
			signer,
			pmail_address,
		)));
	});
}

#[test]
fn it_works_for_set_alias() {
	new_test_ext().execute_with(|| {
		let signer = Public::from_raw([0; 32]);

		let alias: BoundedVec<u8, ConstU32<128>> = vec![1, 2, 3].try_into().unwrap();
		let sub_address = MailAddress::SubAddr(signer);
		let non_sub_address = MailAddress::ETHAddr(vec![1, 2, 3].try_into().unwrap());

		assert_ok!(MailModule::set_alias(
			RuntimeOrigin::signed(signer),
			sub_address.clone(),
			alias.clone()
		));
		assert_eq!(ContactList::<Test>::get(signer, sub_address.clone()), Some(alias.clone()));

		assert_ok!(MailModule::set_alias(
			RuntimeOrigin::signed(signer),
			non_sub_address.clone(),
			alias.clone()
		));
		assert_eq!(ContactList::<Test>::get(signer, non_sub_address.clone()), Some(alias.clone()));

		// assert successful events
		System::assert_has_event(Event::MailModule(crate::Event::SetAliasSuccess(
			signer,
			non_sub_address.clone(),
			alias.clone(),
		)));
	});
}

#[test]
fn it_works_for_send_mail() {
	new_test_ext().execute_with(|| {
		let signer = Public::from_raw([0; 32]);
		let send_to = Public::from_raw([1; 32]);
		let from = MailAddress::SubAddr(signer);
		let to = MailAddress::SubAddr(send_to);
		// let eth_address = MailAddress::ETHAddr(vec![1, 2, 3].try_into().unwrap());
		// let web2_address = MailAddress::NormalAddr(vec![4, 5, 6].try_into().unwrap());
		let hash: BoundedVec<u8, ConstU32<128>> = vec![7, 8, 9].try_into().unwrap();
		let timestamp: u64 = 1;

		let pmail_address: BoundedVec<u8, ConstU32<128>> = vec![1, 2, 3].try_into().unwrap();
		// assert
		assert_ok!(MailModule::bind_address(RuntimeOrigin::signed(signer), pmail_address.clone()));

		assert_ok!(MailModule::send_mail(
			RuntimeOrigin::signed(signer),
			to.clone(),
			timestamp,
			hash.clone()
		));

		assert_eq!(
			MailingList::<Test>::get((from.clone(), to.clone(), timestamp)),
			Some(hash.clone())
		);

		let mail = Mail { timestamp, store_hash: hash.clone() };

		// assert successful events
		System::assert_has_event(Event::MailModule(crate::Event::SendMailSuccess(
			from.clone(),
			to.clone(),
			mail.clone(),
		)));
	});
}

#[test]
fn bind_address_will_fail_when_bind_address_duplicate() {
	new_test_ext().execute_with(|| {
		let signer = Public::from_raw([0; 32]);

		let pmail_address1: BoundedVec<u8, ConstU32<128>> = vec![1, 2, 3].try_into().unwrap();
		let pmail_address2: BoundedVec<u8, ConstU32<128>> = vec![4, 5, 6].try_into().unwrap();

		// assert
		assert_ok!(MailModule::bind_address(RuntimeOrigin::signed(signer), pmail_address1.clone()));

		assert_noop!(
			MailModule::bind_address(RuntimeOrigin::signed(signer), pmail_address2.clone()),
			Error::<Test>::AddressBindDuplicate
		);
	});
}

#[test]
fn send_mail_will_fail_when_address_not_bind() {
	new_test_ext().execute_with(|| {
		let signer = Public::from_raw([0; 32]);
		let send_to = Public::from_raw([1; 32]);
		let to = MailAddress::SubAddr(send_to);
		// let eth_address = MailAddress::ETHAddr(vec![1, 2, 3].try_into().unwrap());
		// let web2_address = MailAddress::NormalAddr(vec![4, 5, 6].try_into().unwrap());
		let hash: BoundedVec<u8, ConstU32<128>> = vec![7, 8, 9].try_into().unwrap();
		let timestamp: u64 = 1;

		assert_noop!(
			MailModule::send_mail(
				RuntimeOrigin::signed(signer),
				to.clone(),
				timestamp,
				hash.clone()
			),
			Error::<Test>::AddressMustBeExist
		);
	});
}

#[test]
fn send_mail_will_fail_when_send_duplicate() {
	new_test_ext().execute_with(|| {
		let signer = Public::from_raw([0; 32]);
		let send_to = Public::from_raw([1; 32]);
		let from = MailAddress::SubAddr(signer);
		let to = MailAddress::SubAddr(send_to);
		// let eth_address = MailAddress::ETHAddr(vec![1, 2, 3].try_into().unwrap());
		// let web2_address = MailAddress::NormalAddr(vec![4, 5, 6].try_into().unwrap());
		let hash: BoundedVec<u8, ConstU32<128>> = vec![7, 8, 9].try_into().unwrap();
		let timestamp: u64 = 1;

		let pmail_address: BoundedVec<u8, ConstU32<128>> = vec![1, 2, 3].try_into().unwrap();
		// assert
		assert_ok!(MailModule::bind_address(RuntimeOrigin::signed(signer), pmail_address.clone()));

		assert_ok!(MailModule::send_mail(
			RuntimeOrigin::signed(signer),
			to.clone(),
			timestamp,
			hash.clone()
		));

		assert_eq!(
			MailingList::<Test>::get((from.clone(), to.clone(), timestamp)),
			Some(hash.clone())
		);

		let mail = Mail { timestamp, store_hash: hash.clone() };

		// assert successful events
		System::assert_has_event(Event::MailModule(crate::Event::SendMailSuccess(
			from.clone(),
			to.clone(),
			mail.clone(),
		)));

		assert_noop!(
			MailModule::send_mail(
				RuntimeOrigin::signed(signer),
				to.clone(),
				timestamp,
				hash.clone()
			),
			Error::<Test>::MailSendDuplicate
		);
	});
}

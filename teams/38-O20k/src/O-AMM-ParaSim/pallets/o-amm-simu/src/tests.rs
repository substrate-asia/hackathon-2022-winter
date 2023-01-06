use crate::{mock::*, Error, Event};
use frame_support::{assert_noop, assert_ok};

#[test]
fn it_works_for_default_value() {
	new_test_ext().execute_with(|| {
		// Go past genesis block so events get deposited
		System::set_block_number(1);
		// Dispatch a signed extrinsic.
		assert_ok!(OAMMSModule::do_something(RuntimeOrigin::signed(1), 42));
		// Read pallet storage and assert an expected result.
		assert_eq!(OAMMSModule::something(), Some(42));
		// Assert that the correct event was deposited
		System::assert_last_event(Event::SomethingStored { something: 42, who: 1 }.into());
	});
}

#[test]
fn correct_error_for_none_value() {
	new_test_ext().execute_with(|| {
		// Ensure the expected error is thrown when no value is present.
		assert_noop!(
			OAMMSModule::cause_error(RuntimeOrigin::signed(1)),
			Error::<Test>::NoneValue
		);
	});
}

#[test]
fn test_swap_amount() {
	new_test_ext().execute_with(|| {
		// Go past genesis block so events get deposited
		System::set_block_number(1);
		// Dispatch a signed extrinsic.
		let pool_name = sp_std::vec![1,2,3];
		let x1 = sp_std::vec![1];
		let y1 = sp_std::vec![2];
		assert_ok!(OAMMSModule::create_swap_pool(RuntimeOrigin::signed(1), pool_name.clone(), super::TokenInfo::new(x1.clone(), 10000), super::TokenInfo::new(y1.clone(), 20000)));
		assert_ok!(OAMMSModule::swap(RuntimeOrigin::signed(1), 
					pool_name, 
					super::TokenInfo::new(x1, 1000000),
					super::TokenInfo::new(y1, 1103612),
					183926700));
	});
}

#[test]
fn test_validate() {
	let in_t_amount: u128 = 100000000;
	let out_t_amount: u128 = 183926700;

	let m = in_t_amount * out_t_amount;
	let s = in_t_amount + out_t_amount;

	let coe: u128 = 100000000;

	let a: u128 = 4 * m * coe / (s * s);

	let swap_precision: u128 = 10000;

	let p2: u128 = swap_precision * swap_precision;

	// let ms = m * s;
	// let l = ms + a * 2 * s * ms / coe + self.c * s * a / coe;
	// let r = a * ms / coe + a * 2 * self.b * ms / coe + self.c * s;
	let b: u128 = 282842712;
	let c: u128 = 200000000;

	let l: u128 = 2 * m / p2 + a * (in_t_amount * in_t_amount + out_t_amount * out_t_amount) / (coe * p2) + 2 * a * c / coe;
	println!("l is: {}", l);
	let r: u128 = a * b * s / (coe * p2) + 2 * c;
	println!("r is: {}", r);

	let mut delta = 0;
	if l > r {
		delta = l - r;
	} else if r > l {
		delta = r - l;
	}
}

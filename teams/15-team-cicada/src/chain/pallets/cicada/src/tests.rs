use crate::{mock::*, Error};
use frame_support::{assert_noop, assert_ok};


#[test]
fn create_category_works() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1];
        let parent: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_ok!(CicadaModule::create_category(Origin::signed(1), name, parent));
	});
}

#[test]
fn create_category_failed_when_name_too_short() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0];
        let parent: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::create_category(Origin::signed(1), name, parent),
			Error::<Test>::TooShort
		);
	});
}

#[test]
fn create_category_failed_when_name_too_long() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1,2,3];
        let parent: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::create_category(Origin::signed(1), name, parent),
			Error::<Test>::TooLong
		);
	});
}

#[test]
fn create_category_failed_when_parent_category_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1,2];
        let parent: [u8; 32] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::create_category(Origin::signed(1), name, parent),
			Error::<Test>::CategoryNotExist
		);
	});
}

#[test]
fn create_category_failed_when_category_already_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1];
        let parent: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let _ = CicadaModule::create_category(Origin::signed(1), name.clone(), parent.clone());
		assert_noop!(
			CicadaModule::create_category(Origin::signed(1), name, parent),
			Error::<Test>::CategoryAlreadyExist
		);
	});
}


#[test]
fn update_category_works() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![2,1];
        let parent: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let hash: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_ok!(CicadaModule::update_category(Origin::signed(1), name, parent, hash));
	});
}

#[test]
fn update_category_failed_when_name_too_short() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0];
        let parent: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let hash: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::update_category(Origin::signed(1), name, parent, hash),
			Error::<Test>::TooShort
		);
	});
}

#[test]
fn update_category_failed_when_name_too_long() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1,2,3];
        let parent: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let hash: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::update_category(Origin::signed(1), name, parent, hash),
			Error::<Test>::TooLong
		);
	});
}

#[test]
fn update_category_failed_when_parent_category_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1,2];
        let parent: [u8; 32] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let hash: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::update_category(Origin::signed(1), name, parent, hash),
			Error::<Test>::CategoryNotExist
		);
	});
}

#[test]
fn update_category_failed_when_category_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1];
        let parent: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let hash: [u8; 32] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::update_category(Origin::signed(1), name, parent, hash),
			Error::<Test>::CategoryNotExist
		);
	});
}


#[test]
fn create_label_works() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_ok!(CicadaModule::create_label(Origin::signed(1), name, category));
	});
}

#[test]
fn create_label_failed_when_name_too_short() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::create_label(Origin::signed(1), name, category),
			Error::<Test>::TooShort
		);
	});
}

#[test]
fn create_label_failed_when_name_too_long() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1,2,3];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::create_label(Origin::signed(1), name, category),
			Error::<Test>::TooLong
		);
	});
}

#[test]
fn create_label_failed_when_category_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1,2];
        let category: [u8; 32] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::create_label(Origin::signed(1), name, category),
			Error::<Test>::CategoryNotExist
		);
	});
}

#[test]
fn create_label_failed_when_label_already_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
		assert_noop!(
			CicadaModule::create_label(Origin::signed(1), name, category),
			Error::<Test>::LabelAlreadyExist
		);
	});
}

#[test]
fn update_label_works() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let hash: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
		assert_ok!(CicadaModule::update_label(Origin::signed(1), name, category, hash));
	});
}

#[test]
fn update_label_failed_when_name_too_short() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let hash: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
		assert_noop!(
			CicadaModule::update_label(Origin::signed(1), name, category, hash),
			Error::<Test>::TooShort
		);
	});
}

#[test]
fn update_label_failed_when_name_too_long() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69,0x1,0x1];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let hash: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
		assert_noop!(
			CicadaModule::update_label(Origin::signed(1), name, category, hash),
			Error::<Test>::TooLong
		);
	});
}

#[test]
fn update_label_failed_when_category_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let hash: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let new_name: Vec<u8> = vec![0x69,0x69,0x1];
        let new_category: [u8; 32] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];        
		assert_noop!(
			CicadaModule::update_label(Origin::signed(1), new_name, new_category, hash),
			Error::<Test>::CategoryNotExist
		);
	});
}

#[test]
fn update_label_failed_when_label_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let hash: [u8; 32] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::update_label(Origin::signed(1), name, category, hash),
			Error::<Test>::LabelNotExist
		);
	});
}



#[test]
fn create_subject_works() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_ok!(CicadaModule::create_subject(Origin::signed(1), name, category));
	});
}

#[test]
fn create_subject_failed_when_name_too_short() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::create_subject(Origin::signed(1), name, category),
			Error::<Test>::TooShort
		);
	});
}

#[test]
fn create_subject_failed_when_name_too_long() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1,2,3];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::create_subject(Origin::signed(1), name, category),
			Error::<Test>::TooLong
		);
	});
}

#[test]
fn create_subject_failed_when_category_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1,2];
        let category: [u8; 32] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::create_subject(Origin::signed(1), name, category),
			Error::<Test>::CategoryNotExist
		);
	});
}

#[test]
fn create_subject_failed_when_subject_already_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
		assert_noop!(
			CicadaModule::create_subject(Origin::signed(1), name, category),
			Error::<Test>::SubjectAlreadyExist
		);
	});
}

#[test]
fn update_subject_works() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let hash: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
		assert_ok!(CicadaModule::update_subject(Origin::signed(1), name, category, hash));
	});
}

#[test]
fn update_subject_failed_when_name_too_short() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let hash: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
		assert_noop!(
			CicadaModule::update_subject(Origin::signed(1), name, category, hash),
			Error::<Test>::TooShort
		);
	});
}

#[test]
fn update_subject_failed_when_name_too_long() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69,0x1,0x1];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let hash: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
		assert_noop!(
			CicadaModule::update_subject(Origin::signed(1), name, category, hash),
			Error::<Test>::TooLong
		);
	});
}

#[test]
fn update_subject_failed_when_category_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let hash: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let new_name: Vec<u8> = vec![0x69,0x69,0x1];
        let new_category: [u8; 32] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];        
		assert_noop!(
			CicadaModule::update_subject(Origin::signed(1), new_name, new_category, hash),
			Error::<Test>::CategoryNotExist
		);
	});
}

#[test]
fn update_subject_failed_when_subject_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let hash: [u8; 32] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::update_subject(Origin::signed(1), name, category, hash),
			Error::<Test>::SubjectNotExist
		);
	});
}


#[test]
fn create_dimension_works() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
		assert_ok!(CicadaModule::create_dimension(Origin::signed(1), name, subject));
	});
}

#[test]
fn create_dimension_failed_when_name_too_short() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0];
        let subject: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::create_dimension(Origin::signed(1), name, subject),
			Error::<Test>::TooShort
		);
	});
}

#[test]
fn create_dimension_failed_when_name_too_long() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1,2,3];
        let subject: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::create_dimension(Origin::signed(1), name, subject),
			Error::<Test>::TooLong
		);
	});
}

#[test]
fn create_dimension_failed_when_subject_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1,2];
        let subject: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::create_dimension(Origin::signed(1), name, subject),
			Error::<Test>::SubjectNotExist
		);
	});
}

#[test]
fn create_dimension_failed_when_dimension_already_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject.clone());
		assert_noop!(
			CicadaModule::create_dimension(Origin::signed(1), name, subject),
			Error::<Test>::DimensionAlreadyExist
		);
	});
}

#[test]
fn update_dimension_works() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];

        let _ = CicadaModule::create_dimension(Origin::signed(1), name, subject);
        let new_name = vec![0x69,0x69, 0x1];
		assert_ok!(CicadaModule::update_dimension(Origin::signed(1), new_name, subject.clone(), dimension));
	});
}

#[test]
fn update_dimension_failed_when_name_too_short() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69];
        let subject: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let hash: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
		assert_noop!(
			CicadaModule::update_dimension(Origin::signed(1), name, subject, hash),
			Error::<Test>::TooShort
		);
	});
}

#[test]
fn update_dimension_failed_when_name_too_long() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69,0x1,0x1];
        let subject: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let hash: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
		assert_noop!(
			CicadaModule::update_dimension(Origin::signed(1), name, subject, hash),
			Error::<Test>::TooLong
		);
	});
}

#[test]
fn update_dimension_failed_when_subject_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject.clone());
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];

        let new_name: Vec<u8> = vec![0x69,0x69,0x1];
        let new_subject: [u8; 32] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];        
		assert_noop!(
			CicadaModule::update_dimension(Origin::signed(1), new_name, new_subject, dimension),
			Error::<Test>::SubjectNotExist
		);
	});
}

#[test]
fn update_dimension_failed_when_dimension_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1];
        let subject: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let hash: [u8; 32] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::update_dimension(Origin::signed(1), name, subject, hash),
			Error::<Test>::DimensionNotExist
		);
	});
}


#[test]
fn create_content_works() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let label: Vec<u8> = vec![0x01,0x02];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);

		assert_ok!(CicadaModule::create_content(Origin::signed(1), category, label, subject, dimension, name));
	});
}

#[test]
fn create_content_failed_when_name_too_short() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69];
        let label: Vec<u8> = vec![0x01,0x02];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);
		assert_noop!(
			CicadaModule::create_content(Origin::signed(1), category, label, subject, dimension, name),
			Error::<Test>::TooShort
		);
	});
}

#[test]
fn create_content_failed_when_name_too_long() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1,2,3];
        let label: Vec<u8> = vec![0x01,0x02];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);
		assert_noop!(
			CicadaModule::create_content(Origin::signed(1), category, label, subject, dimension, name),
			Error::<Test>::TooLong
		);
	});
}

#[test]
fn create_content_failed_when_label_too_long() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1,2];
        let label: Vec<u8> = vec![0x01,0x02, 0x1, 0x2];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);
		assert_noop!(
			CicadaModule::create_content(Origin::signed(1), category, label, subject, dimension, name),
			Error::<Test>::TooLong
		);
	});
}

#[test]
fn create_content_failed_when_category_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1,2];
        let label: Vec<u8> = vec![0x01,0x02, 0x1];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);
        let category2: [u8; 32] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::create_content(Origin::signed(1), category2, label, subject, dimension, name),
			Error::<Test>::CategoryNotExist
		);
	});
}

#[test]
fn create_content_failed_when_dimension_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let label: Vec<u8> = vec![0x01,0x02];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        // let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);
		assert_noop!(
			CicadaModule::create_content(Origin::signed(1), category, label, subject, dimension, name),
			Error::<Test>::DimensionNotExist
		);
	});
}

#[test]
fn create_content_failed_when_subject_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0,1,2];
        let label: Vec<u8> = vec![0x01,0x02, 0x1];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);

		assert_noop!(
			CicadaModule::create_content(Origin::signed(1), category, label, subject, dimension, name),
			Error::<Test>::SubjectNotExist
		);
	});
}

#[test]
fn create_content_failed_when_content_already_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let label: Vec<u8> = vec![0x01,0x02];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];

        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);
        let _ = CicadaModule::create_content(Origin::signed(1), category.clone(), label.clone(), subject.clone(), dimension.clone(), name.clone());

		assert_noop!(
			CicadaModule::create_content(Origin::signed(1), category, label, subject, dimension, name),
			Error::<Test>::ContentAlreadyExist
		);
	});
}

#[test]
fn update_content_works() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let label: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);
        let _ = CicadaModule::create_content(Origin::signed(1), category.clone(), label.clone(), subject.clone(), dimension.clone(), name.clone());
        let hash: [u8; 32] = [
            141, 172, 113, 154, 212, 45,  45,   0,
            81,  34,  96, 174, 238, 37, 179, 134,
            45,  68, 217,  49,  37, 39,  70,  40,
           252,  33,  60, 188,  93, 95, 249, 195            
        ];
        let new_content = vec![0x69,0x69, 0x2];
		assert_ok!(CicadaModule::update_content(Origin::signed(1), category, label, subject, dimension, new_content, hash));
	});
}

#[test]
fn update_content_failed_when_name_too_short() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let label: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);
        let _ = CicadaModule::create_content(Origin::signed(1), category.clone(), label.clone(), subject.clone(), dimension.clone(), name);
        let hash: [u8; 32] = [
            141, 172, 113, 154, 212, 45,  45,   0,
            81,  34,  96, 174, 238, 37, 179, 134,
            45,  68, 217,  49,  37, 39,  70,  40,
           252,  33,  60, 188,  93, 95, 249, 195            
        ];
        let new_content = vec![0x69];
		assert_noop!(
			CicadaModule::update_content(Origin::signed(1), category, label, subject, dimension, new_content, hash),
			Error::<Test>::TooShort
		);
	});
}

#[test]
fn update_content_failed_when_name_too_long() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let label: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);
        let _ = CicadaModule::create_content(Origin::signed(1), category.clone(), label.clone(), subject.clone(), dimension.clone(), name);
        let hash: [u8; 32] = [
            141, 172, 113, 154, 212, 45,  45,   0,
            81,  34,  96, 174, 238, 37, 179, 134,
            45,  68, 217,  49,  37, 39,  70,  40,
           252,  33,  60, 188,  93, 95, 249, 195            
        ];
        let new_content = vec![0x69,0x69,0x69,0x69];
		assert_noop!(
			CicadaModule::update_content(Origin::signed(1), category, label, subject, dimension, new_content, hash),
			Error::<Test>::TooLong
		);
	});
}


#[test]
fn update_content_failed_when_label_too_long() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let label: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);
        let _ = CicadaModule::create_content(Origin::signed(1), category.clone(), label.clone(), subject.clone(), dimension.clone(), name);
        let hash: [u8; 32] = [
            141, 172, 113, 154, 212, 45,  45,   0,
            81,  34,  96, 174, 238, 37, 179, 134,
            45,  68, 217,  49,  37, 39,  70,  40,
           252,  33,  60, 188,  93, 95, 249, 195            
        ];
        let new_content = vec![0x69,0x69];
        let new_label: Vec<u8> = vec![0x69,0x69, 0x69,0x69];
		assert_noop!(
			CicadaModule::update_content(Origin::signed(1), category, new_label, subject, dimension, new_content, hash),
			Error::<Test>::TooLong
		);
	});
}



#[test]
fn update_content_failed_when_category_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let label: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);
        let _ = CicadaModule::create_content(Origin::signed(1), category, label, subject.clone(), dimension.clone(), name);
        let hash: [u8; 32] = [
            141, 172, 113, 154, 212, 45,  45,   0,
            81,  34,  96, 174, 238, 37, 179, 134,
            45,  68, 217,  49,  37, 39,  70,  40,
           252,  33,  60, 188,  93, 95, 249, 195            
        ];
        let new_category: [u8; 32] = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let new_content = vec![0x69,0x69];
        let new_label: Vec<u8> = vec![0x69,0x69];

		assert_noop!(
			CicadaModule::update_content(Origin::signed(1), new_category, new_label, subject, dimension, new_content, hash),
			Error::<Test>::CategoryNotExist
		);
	});
}

#[test]
fn update_content_failed_when_dimension_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let label: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);
        let _ = CicadaModule::create_content(Origin::signed(1), category, label, subject.clone(), dimension.clone(), name);
        let hash: [u8; 32] = [
            141, 172, 113, 154, 212, 45,  45,   0,
            81,  34,  96, 174, 238, 37, 179, 134,
            45,  68, 217,  49,  37, 39,  70,  40,
           252,  33,  60, 188,  93, 95, 249, 195            
        ];
        let new_category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let new_content = vec![0x69,0x69];
        let new_label: Vec<u8> = vec![0x69,0x69];
        let new_dimension: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

		assert_noop!(
			CicadaModule::update_content(Origin::signed(1), new_category, new_label, subject, new_dimension, new_content, hash),
			Error::<Test>::DimensionNotExist
		);        
	});
}

#[test]
fn update_content_failed_when_subject_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let label: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];

        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
             71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
             32, 104,  44, 147
        ];
        let dimension: [u8; 32] = [   
            22, 169, 201, 207, 115, 215, 230, 152,
            32, 204, 190, 156, 106, 141,  87, 212,
            118,  73, 107,  26, 116,   2, 161,  26,
            36,  47,  36, 234, 237, 155, 195, 175
        ];
        let _ = CicadaModule::create_label(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_subject(Origin::signed(1), name.clone(), category.clone());
        let _ = CicadaModule::create_dimension(Origin::signed(1), name.clone(), subject);
        let _ = CicadaModule::create_content(Origin::signed(1), category, label, subject, dimension.clone(), name);
        let hash: [u8; 32] = [
            141, 172, 113, 154, 212, 45,  45,   0,
            81,  34,  96, 174, 238, 37, 179, 134,
            45,  68, 217,  49,  37, 39,  70,  40,
           252,  33,  60, 188,  93, 95, 249, 195            
        ];
        let new_category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let new_content = vec![0x69,0x69];
        let new_label: Vec<u8> = vec![0x69,0x69];
        let new_dimension: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let new_subject: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
		assert_noop!(
			CicadaModule::update_content(Origin::signed(1), new_category, new_label, new_subject, new_dimension, new_content, hash),
			Error::<Test>::SubjectNotExist
		);   

	});
}



#[test]
fn subscribe_subject_works() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
            71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
            32, 104,  44, 147
        ];
        let _ = CicadaModule::create_subject(Origin::signed(1), name, category);
		assert_ok!(CicadaModule::subscribe_subject(Origin::signed(1), subject));
	});
}

#[test]
fn subscribe_subject_failed_when_subscribe_already_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
            71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
            32, 104,  44, 147
        ];
        let _ = CicadaModule::create_subject(Origin::signed(1), name, category);
        let _ = CicadaModule::subscribe_subject(Origin::signed(1), subject);
		assert_noop!(
			CicadaModule::subscribe_subject(Origin::signed(1), subject),
			Error::<Test>::SubscribeAlreadyExist
		);
	});
}

#[test]
fn subscribe_subject_failed_when_subject_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
            71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
            32, 104,  44, 148
        ];
        let _ = CicadaModule::create_subject(Origin::signed(1), name, category);
		assert_noop!(
			CicadaModule::subscribe_subject(Origin::signed(1), subject),
			Error::<Test>::SubjectNotExist
		);
	});
}

#[test]
fn cancal_subscribe_works() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
            71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
            32, 104,  44, 147
        ];
        let _ = CicadaModule::create_subject(Origin::signed(1), name, category);
        let _ = CicadaModule::subscribe_subject(Origin::signed(1), subject.clone());
        assert_ok!(CicadaModule::cancal_subscribe(Origin::signed(1), subject));
	});
}

#[test]
fn cancal_subscribe_failed_when_subject_not_exist() {
	new_test_ext().execute_with(|| {
        let name: Vec<u8> = vec![0x69,0x69];
        let category: [u8; 32] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
        let subject: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
            71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
            32, 104,  44, 147
        ];
        let _ = CicadaModule::create_subject(Origin::signed(1), name, category);
        let _ = CicadaModule::subscribe_subject(Origin::signed(1), subject);
        let subject2: [u8; 32] = [
            101,  19, 235, 158,  74, 137,  68,
            237, 246, 249, 156, 175, 188, 218,
            71, 238, 103, 225, 209,   0, 104,
            186, 137, 167,   9, 205, 252, 166,
            32, 104,  44, 148
        ];        
		assert_noop!(
			CicadaModule::cancal_subscribe(Origin::signed(1), subject2),
			Error::<Test>::SubscribeNotExist
		);
	});
}
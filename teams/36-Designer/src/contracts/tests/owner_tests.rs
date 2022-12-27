use de_signer::*;
use gstd::Encode;
use gtest::{Program, System};

const USERS: &[[u8; 32]] = &[[1_u8; 32], [2_u8; 32], [3_u8; 32], [4_u8; 32]];

fn common_init(sys: &System, user: [u8; 32]) -> Program {
    sys.init_logger();

    let designer = Program::current(sys);

    designer.send(USERS[0], DeSignerInitParams { owner: user.into() });

    designer
}

#[test]
fn transfer_owner() {
    let sys = System::new();
    let designer = common_init(&sys, USERS[0]);

    sys.mint_to(USERS[0], 1_000_000_000);
    let res = designer.send_with_value(
        USERS[0],
        DeSignerAction::TransferOwner {
            owner: USERS[1].into(),
        },
        0,
    );

    let expect = DeSignerEvent::TransferOwner {
        old: USERS[0].into(),
        new: USERS[1].into(),
    };

    assert!(res.contains(&(USERS[0], expect.encode())));
}

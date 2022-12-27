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
fn create_contract() {
    let sys = System::new();
    let designer = common_init(&sys, USERS[0]);

    sys.mint_to(USERS[0], 1_000_000_000);
    let res = designer.send(
        USERS[0],
        DeSignerAction::CreateContract {
            name: "test contract v1.0".to_string(),
            signers: vec![USERS[1].into(), USERS[2].into()],
            file: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "cess://xx".to_string(),
                memo: Some("important!!".to_string()),
            },
            expire: sys.block_timestamp() + 1000,
        },
    );

    let expect = DeSignerEvent::CreateContract {
        id: 0,
        name: "test contract v1.0".to_string(),
        creator: USERS[0].into(),
        digest: DigestAlgo::SHA256("X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string()),
    };

    assert!(res.contains(&(USERS[0], expect.encode())));
}

#[test]
fn create_contract_empty_memo() {
    let sys = System::new();
    let designer = common_init(&sys, USERS[0]);

    sys.mint_to(USERS[0], 1_000_000_000);
    let res = designer.send(
        USERS[0],
        DeSignerAction::CreateContract {
            name: "test v1.0".to_string(),
            signers: vec![USERS[1].into()],
            file: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "cess://xx".to_string(),
                memo: None,
            },
            expire: sys.block_timestamp() + 1000,
        },
    );

    let expect = DeSignerEvent::CreateContract {
        id: 0,
        name: "test v1.0".to_string(),
        creator: USERS[0].into(),
        digest: DigestAlgo::SHA256("X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string()),
    };

    assert!(res.contains(&(USERS[0], expect.encode())));
}

#[test]
fn agree_contract() {
    let sys = System::new();
    let designer = common_init(&sys, USERS[0]);

    sys.mint_to(USERS[0], 1_000_000_000);
    let res = designer.send(
        USERS[0],
        DeSignerAction::CreateContract {
            name: "test v1.0".to_string(),
            signers: vec![USERS[1].into()],
            file: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "cess://xx".to_string(),
                memo: None,
            },
            expire: sys.block_timestamp() + 1000,
        },
    );
    assert!(!res.main_failed());

    let res = designer.send(
        USERS[1],
        DeSignerAction::AgreeOnContract {
            id: 0,
            resource: None,
        },
    );

    assert!(res.contains(&(
        USERS[1],
        DeSignerEvent::AgreeOnContract {
            id: 0,
            signer: USERS[1].into()
        }
        .encode()
    )));
}

#[test]
fn agree_contract_with_res() {
    let sys = System::new();
    let designer = common_init(&sys, USERS[0]);

    sys.mint_to(USERS[0], 1_000_000_000);
    let res = designer.send(
        USERS[0],
        DeSignerAction::CreateContract {
            name: "test v1.0".to_string(),
            signers: vec![USERS[1].into()],
            file: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "cess://xx".to_string(),
                memo: None,
            },
            expire: sys.block_timestamp() + 1000,
        },
    );
    assert!(!res.main_failed());

    let res = designer.send(
        USERS[1],
        DeSignerAction::AgreeOnContract {
            id: 0,
            resource: Some(ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "cess://xx".to_string(),
                memo: Some("123".to_string()),
            }),
        },
    );

    assert!(res.contains(&(
        USERS[1],
        DeSignerEvent::AgreeOnContract {
            id: 0,
            signer: USERS[1].into()
        }
        .encode()
    )));
}

#[test]
fn creat_contract_with_agree() {
    let sys = System::new();
    let designer = common_init(&sys, USERS[0]);

    sys.mint_to(USERS[0], 1_000_000_000);
    let res = designer.send(
        USERS[1],
        DeSignerAction::CreateContractWithAgree {
            name: "test v1.0".to_string(),
            signers: vec![USERS[1].into()],
            file: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "cess://xx".to_string(),
                memo: Some("123".to_string()),
            },
            resource: Some(ResourceParam {
                digest: DigestAlgo::SHA256("123".to_string()),
                url: "cess://xx".to_string(),
                memo: Some("123".to_string()),
            }),
            expire: sys.block_timestamp() + 1000,
        },
    );

    assert!(res.contains(&(
        USERS[1],
        DeSignerEvent::AgreeOnContract {
            id: 0,
            signer: USERS[1].into()
        }
        .encode()
    )));
}

#[test]
fn upload_attachment() {
    let sys = System::new();
    let designer = common_init(&sys, USERS[0]);

    sys.mint_to(USERS[0], 1_000_000_000);
    let res = designer.send(
        USERS[0],
        DeSignerAction::CreateContract {
            name: "test v1.0".to_string(),
            signers: vec![USERS[1].into()],
            file: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "cess://xx".to_string(),
                memo: None,
            },
            expire: sys.block_timestamp() + 1000,
        },
    );
    assert!(!res.main_failed());

    let res = designer.send(
        USERS[1],
        DeSignerAction::UploadAttachment {
            id: 0,
            attachment: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "0x123".to_string(),
                memo: Some("123".to_string()),
            },
        },
    );

    assert!(res.contains(&(
        USERS[1],
        DeSignerEvent::UploadMetadata {
            id: 0,
            creator: USERS[1].into(),
            digest: DigestAlgo::SHA256("X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string()),
            cate: ResourceCate::Attachment
        }
        .encode()
    )));
}

#[test]
fn upload_resource() {
    let sys = System::new();
    let designer = common_init(&sys, USERS[0]);

    sys.mint_to(USERS[0], 1_000_000_000);
    let res = designer.send(
        USERS[0],
        DeSignerAction::CreateContract {
            name: "test v1.0".to_string(),
            signers: vec![USERS[1].into()],
            file: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "cess://xx".to_string(),
                memo: None,
            },
            expire: sys.block_timestamp() + 1000,
        },
    );
    assert!(!res.main_failed());

    let res = designer.send(
        USERS[1],
        DeSignerAction::UploadResource {
            id: 0,
            resource: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "0x123".to_string(),
                memo: Some("123".to_string()),
            },
        },
    );

    assert!(res.contains(&(
        USERS[1],
        DeSignerEvent::UploadMetadata {
            id: 0,
            creator: USERS[1].into(),
            digest: DigestAlgo::SHA256("X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string()),
            cate: ResourceCate::FileMetadata
        }
        .encode()
    )));
}

#[test]
fn abrogate_contract() {
    let sys = System::new();
    let designer = common_init(&sys, USERS[0]);

    sys.mint_to(USERS[0], 1_000_000_000);
    let res = designer.send(
        USERS[0],
        DeSignerAction::CreateContract {
            name: "test v1.0".to_string(),
            signers: vec![USERS[1].into()],
            file: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "cess://xx".to_string(),
                memo: None,
            },
            expire: sys.block_timestamp() + 1000,
        },
    );
    assert!(!res.main_failed());

    let res = designer.send(
        USERS[1],
        DeSignerAction::AbrogateContract {
            id: 0,
            resource: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "0x123".to_string(),
                memo: Some("123".to_string()),
            },
        },
    );

    assert!(res.contains(&(
        USERS[1],
        DeSignerEvent::AbrogateContract {
            id: 0,
            sender: USERS[1].into()
        }
        .encode()
    )));
}

#[test]
fn abrogate_contract_fail() {
    let sys = System::new();
    let designer = common_init(&sys, USERS[0]);

    sys.mint_to(USERS[0], 1_000_000_000);
    let res = designer.send(
        USERS[0],
        DeSignerAction::CreateContract {
            name: "test v1.0".to_string(),
            signers: vec![USERS[1].into()],
            file: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "cess://xx".to_string(),
                memo: None,
            },
            expire: sys.block_timestamp() + 1000,
        },
    );
    assert!(!res.main_failed());

    let res = designer.send(
        USERS[1],
        DeSignerAction::AgreeOnContract {
            id: 0,
            resource: None,
        },
    );
    assert!(!res.main_failed());

    let res = designer.send(
        USERS[1],
        DeSignerAction::AbrogateContract {
            id: 0,
            resource: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "0x123".to_string(),
                memo: Some("123".to_string()),
            },
        },
    );
    assert!(res.main_failed());
}

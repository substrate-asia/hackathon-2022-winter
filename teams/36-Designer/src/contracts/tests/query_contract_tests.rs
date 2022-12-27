use de_signer::*;
use gtest::{Program, Result, System};

const USERS: &[[u8; 32]] = &[[1_u8; 32], [2_u8; 32], [3_u8; 32], [4_u8; 32]];

fn common_init(sys: &System, user: [u8; 32]) -> Program {
    sys.init_logger();

    let designer = Program::current(sys);

    designer.send(USERS[0], DeSignerInitParams { owner: user.into() });

    designer
}

#[test]
fn query_index() {
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
    assert!(!res.main_failed());

    let res: Result<StateResponse> = designer.meta_state(StateReq::Index());
    match res.unwrap() {
        StateResponse::U64(index) => {
            assert_eq!(index, 1);
        }
        _ => {
            panic!("wrong")
        }
    }
}

#[test]
fn query_contract_by_id() {
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
    assert!(!res.main_failed());

    let res: Result<StateResponse> = designer.meta_state(StateReq::QueryContractById(0));
    match res.unwrap() {
        StateResponse::Contract(ret) => {
            assert_eq!(ret.id, 0);
        }
        _ => {
            panic!("wrong")
        }
    }
}

#[test]
fn query_contract_empty() {
    let sys = System::new();
    let designer = common_init(&sys, USERS[0]);

    sys.mint_to(USERS[0], 1_000_000_000);
    let res: Result<StateResponse> = designer.meta_state(StateReq::QueryContractByCreator(
        PageParam {
            page_num: 1,
            page_size: 1,
        },
        USERS[0].into(),
    ));
    match res.unwrap() {
        StateResponse::Contracts(ret) => {
            assert_eq!(ret.pages, 0);
        }
        _ => {
            panic!("wrong")
        }
    }

    let res: Result<StateResponse> = designer.meta_state(StateReq::QueryContractBySigner(
        PageParam {
            page_num: 2,
            page_size: 1,
        },
        USERS[0].into(),
    ));
    match res.unwrap() {
        StateResponse::Contracts(ret) => {
            assert_eq!(ret.pages, 0);
        }
        _ => {
            panic!("wrong")
        }
    }

    let res: Result<StateResponse> = designer.meta_state(StateReq::QueryContractBySignerAndStatus(
        PageParam {
            page_num: 2,
            page_size: 1,
        },
        USERS[0].into(),
        vec![ContractStatus::Created, ContractStatus::Signing],
    ));
    match res.unwrap() {
        StateResponse::Contracts(ret) => {
            assert_eq!(ret.pages, 0);
        }
        _ => {
            panic!("wrong")
        }
    }
}

#[test]
fn query_contract_by_creator() {
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
    assert!(!res.main_failed());
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
    assert!(!res.main_failed());

    let res: Result<StateResponse> = designer.meta_state(StateReq::QueryContractByCreator(
        PageParam {
            page_num: 1,
            page_size: 1,
        },
        USERS[0].into(),
    ));
    match res.unwrap() {
        StateResponse::Contracts(ret) => {
            assert_eq!(ret.pages, 2);
            assert_eq!(ret.page_num, 1);
            assert_eq!(ret.page_size, 1);
            assert_eq!(ret.data.len(), 1);
            assert_eq!(ret.data[0].id, 0);
        }
        _ => {
            panic!("wrong")
        }
    }

    let res: Result<StateResponse> = designer.meta_state(StateReq::QueryContractByCreator(
        PageParam {
            page_num: 2,
            page_size: 1,
        },
        USERS[0].into(),
    ));
    match res.unwrap() {
        StateResponse::Contracts(ret) => {
            assert_eq!(ret.pages, 2);
            assert_eq!(ret.page_num, 2);
            assert_eq!(ret.page_size, 1);
            assert_eq!(ret.data.len(), 1);
            assert_eq!(ret.data[0].id, 1);
        }
        _ => {
            panic!("wrong")
        }
    }
}

#[test]
fn query_contract_by_signer() {
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
    assert!(!res.main_failed());
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
    assert!(!res.main_failed());

    let res: Result<StateResponse> = designer.meta_state(StateReq::QueryContractBySigner(
        PageParam {
            page_num: 1,
            page_size: 1,
        },
        USERS[1].into(),
    ));
    match res.unwrap() {
        StateResponse::Contracts(ret) => {
            assert_eq!(ret.pages, 2);
            assert_eq!(ret.page_num, 1);
            assert_eq!(ret.page_size, 1);
            assert_eq!(ret.data.len(), 1);
            assert_eq!(ret.data[0].id, 0);
        }
        _ => {
            panic!("wrong")
        }
    }

    let res: Result<StateResponse> = designer.meta_state(StateReq::QueryContractBySigner(
        PageParam {
            page_num: 2,
            page_size: 1,
        },
        USERS[1].into(),
    ));
    match res.unwrap() {
        StateResponse::Contracts(ret) => {
            assert_eq!(ret.pages, 2);
            assert_eq!(ret.page_num, 2);
            assert_eq!(ret.page_size, 1);
            assert_eq!(ret.data.len(), 1);
            assert_eq!(ret.data[0].id, 1);
        }
        _ => {
            panic!("wrong")
        }
    }
}

#[test]
fn query_contract_by_signer_and_status() {
    let sys = System::new();
    let designer = common_init(&sys, USERS[0]);

    sys.mint_to(USERS[0], 1_000_000_000);
    let res = designer.send(
        USERS[0],
        DeSignerAction::CreateContract {
            name: "test contract v1.0".to_string(),
            signers: vec![USERS[0].into()],
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
    assert!(!res.main_failed());

    let res = designer.send(
        USERS[0],
        DeSignerAction::CreateContractWithAgree {
            name: "test contract v2.0".to_string(),
            signers: vec![USERS[0].into()],
            file: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "cess://xx".to_string(),
                memo: Some("important!!".to_string()),
            },
            resource: Some(ResourceParam {
                digest: DigestAlgo::SHA256("123".to_string()),
                url: "cess://xx".to_string(),
                memo: Some("123".to_string()),
            }),
            expire: sys.block_timestamp() + 1000,
        },
    );
    assert!(!res.main_failed());

    let res = designer.send(
        USERS[0],
        DeSignerAction::CreateContractWithAgree {
            name: "test contract v3.0".to_string(),
            signers: vec![USERS[0].into(), USERS[1].into()],
            file: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "cess://xx".to_string(),
                memo: Some("important!!".to_string()),
            },
            resource: Some(ResourceParam {
                digest: DigestAlgo::SHA256("123".to_string()),
                url: "cess://xx".to_string(),
                memo: Some("123".to_string()),
            }),
            expire: sys.block_timestamp() + 1000,
        },
    );
    assert!(!res.main_failed());

    let res = designer.send(
        USERS[0],
        DeSignerAction::CreateContractWithAgree {
            name: "test contract v4.0".to_string(),
            signers: vec![USERS[0].into(), USERS[1].into()],
            file: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "cess://xx".to_string(),
                memo: Some("important!!".to_string()),
            },
            resource: Some(ResourceParam {
                digest: DigestAlgo::SHA256("123".to_string()),
                url: "cess://xx".to_string(),
                memo: Some("123".to_string()),
            }),
            expire: sys.block_timestamp() + 1000,
        },
    );
    assert!(!res.main_failed());

    let res = designer.send(
        USERS[0],
        DeSignerAction::AbrogateContract {
            id: 3,
            resource: ResourceParam {
                digest: DigestAlgo::SHA256(
                    "X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=".to_string(),
                ),
                url: "cess://xx".to_string(),
                memo: Some("important!!".to_string()),
            },
        },
    );
    assert!(!res.main_failed());

    let res: Result<StateResponse> = designer.meta_state(StateReq::QueryContractBySignerAndStatus(
        PageParam {
            page_num: 1,
            page_size: 1,
        },
        USERS[0].into(),
        vec![ContractStatus::Created, ContractStatus::Signing],
    ));
    match res.unwrap() {
        StateResponse::Contracts(ret) => {
            assert_eq!(ret.pages, 2);
            assert_eq!(ret.page_num, 1);
            assert_eq!(ret.page_size, 1);
            assert_eq!(ret.data.len(), 1);
            assert_eq!(ret.data[0].id, 0);
        }
        _ => {
            panic!("wrong")
        }
    }

    let res: Result<StateResponse> = designer.meta_state(StateReq::QueryContractBySignerAndStatus(
        PageParam {
            page_num: 2,
            page_size: 1,
        },
        USERS[0].into(),
        vec![ContractStatus::Created, ContractStatus::Signing],
    ));
    match res.unwrap() {
        StateResponse::Contracts(ret) => {
            assert_eq!(ret.pages, 2);
            assert_eq!(ret.page_num, 2);
            assert_eq!(ret.page_size, 1);
            assert_eq!(ret.data.len(), 1);
            assert_eq!(ret.data[0].id, 2);
        }
        _ => {
            panic!("wrong")
        }
    }

    let res: Result<StateResponse> = designer.meta_state(StateReq::QueryContractBySignerAndStatus(
        PageParam {
            page_num: 1,
            page_size: 1,
        },
        USERS[0].into(),
        vec![ContractStatus::Sealed, ContractStatus::Abrogated],
    ));
    match res.unwrap() {
        StateResponse::Contracts(ret) => {
            assert_eq!(ret.pages, 2);
            assert_eq!(ret.page_num, 1);
            assert_eq!(ret.page_size, 1);
            assert_eq!(ret.data.len(), 1);
            assert_eq!(ret.data[0].id, 1);
        }
        _ => {
            panic!("wrong")
        }
    }

    let res: Result<StateResponse> = designer.meta_state(StateReq::QueryContractBySignerAndStatus(
        PageParam {
            page_num: 2,
            page_size: 1,
        },
        USERS[0].into(),
        vec![ContractStatus::Sealed, ContractStatus::Abrogated],
    ));
    match res.unwrap() {
        StateResponse::Contracts(ret) => {
            assert_eq!(ret.pages, 2);
            assert_eq!(ret.page_num, 2);
            assert_eq!(ret.page_size, 1);
            assert_eq!(ret.data.len(), 1);
            assert_eq!(ret.data[0].id, 3);
        }
        _ => {
            panic!("wrong")
        }
    }
}

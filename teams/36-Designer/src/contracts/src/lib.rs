#![no_std]

extern crate alloc;

mod designer;
mod io;
mod page;
mod state;

pub use designer::*;
use gstd::{debug, metadata, msg, prelude::*};
pub use io::*;
pub use page::*;
pub use state::*;

metadata! {
    title: "De-Signer",
    init:
        input: DeSignerInitParams,
    handle:
        input: DeSignerAction,
        output: DeSignerEvent,
    state:
        input: StateReq,
        output: StateResponse,
}

static mut GLOBAL: Option<DeSignerState> = None;

/// # Safety
/// handle by gear
#[no_mangle]
pub unsafe extern "C" fn init() {
    let params: DeSignerInitParams = msg::load().expect("Unable to decode payload");
    debug!("init(): {:?}", params);
    let mut state = DeSignerState::default();
    state.set_owner(params.owner);
    GLOBAL = Some(state);
}

/// # Safety
/// handle by gear
#[no_mangle]
pub unsafe extern "C" fn handle() {
    let action: DeSignerAction = msg::load().expect("Unable to decode payload");
    let state = GLOBAL.as_mut().expect("globalState not init");
    debug!("handle(): {:?}", action);
    match action {
        DeSignerAction::CreateContract {
            name,
            signers,
            file,
            expire,
        } => {
            state.create_contract(name, signers, file, expire, true);
        }
        DeSignerAction::CreateContractWithAgree {
            name,
            signers,
            file,
            expire,
            resource,
        } => state.create_contract_with_agree(name, signers, file, expire, resource),
        DeSignerAction::UploadAttachment { id, attachment } => {
            state.upload_attachment(id, attachment)
        }
        DeSignerAction::UploadResource { id, resource } => state.upload_metadata(id, resource),
        DeSignerAction::AgreeOnContract { id, resource } => state.agree_on_contract(id, resource),
        DeSignerAction::AbrogateContract { id, resource } => state.abrogate_contract(id, resource),
        DeSignerAction::TransferOwner { owner } => state.transfer_owner(owner),
    }
}

/// # Safety
/// handle by gear
#[no_mangle]
pub unsafe extern "C" fn meta_state() -> *mut [i32; 2] {
    let req: StateReq = msg::load().expect("Unable to decode payload");
    let state = GLOBAL.as_mut().expect("globalState not init");
    debug!("meta_state(): {:?}", req);
    let resp = match req {
        StateReq::QueryContractByCreator(param, addr) => {
            StateResponse::Contracts(state.query_contract_by_creator(param, addr))
        }
        StateReq::QueryContractBySigner(param, addr) => {
            StateResponse::Contracts(state.query_contract_by_signer(param, addr))
        }
        StateReq::QueryContractBySignerAndStatus(param, addr, statuses) => {
            StateResponse::Contracts(
                state.query_contract_by_signer_and_status(param, addr, statuses),
            )
        }
        StateReq::QueryContractById(param) => {
            StateResponse::Contract(state.query_contract_by_id(param))
        }
        StateReq::Owner() => StateResponse::Address(state.owner()),
        StateReq::Index() => StateResponse::U64(state.index()),
    };
    gstd::util::to_leak_ptr(resp.encode())
}

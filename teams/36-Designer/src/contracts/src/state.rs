use crate::page::PageParam;
use crate::PageRet;
use crate::{Contract, ContractStatus};
use gstd::{prelude::*, ActorId};

#[derive(Debug, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum StateReq {
    QueryContractByCreator(PageParam, ActorId),
    QueryContractBySigner(PageParam, ActorId),
    QueryContractBySignerAndStatus(PageParam, ActorId, Vec<ContractStatus>),
    QueryContractById(u64),
    Owner(),
    Index(),
}

#[derive(Debug, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum StateResponse {
    Contract(Contract),
    Contracts(PageRet<Contract>),
    Address(ActorId),
    U64(u64),
}

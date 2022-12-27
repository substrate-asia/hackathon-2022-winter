use crate::{DigestAlgo, ResourceCate, ResourceParam};
use gstd::{prelude::*, ActorId};

#[derive(Debug, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum DeSignerAction {
    CreateContract {
        name: String,
        signers: Vec<ActorId>,
        file: ResourceParam,
        expire: u64,
    },
    CreateContractWithAgree {
        name: String,
        signers: Vec<ActorId>,
        file: ResourceParam,
        resource: Option<ResourceParam>,
        expire: u64,
    },
    UploadAttachment {
        id: u64,
        attachment: ResourceParam,
    },
    UploadResource {
        id: u64,
        resource: ResourceParam,
    },
    AgreeOnContract {
        id: u64,
        resource: Option<ResourceParam>,
    },
    AbrogateContract {
        id: u64,
        resource: ResourceParam,
    },
    TransferOwner {
        owner: ActorId,
    },
}

#[derive(Debug, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum DeSignerEvent {
    CreateContract {
        id: u64,
        name: String,
        creator: ActorId,
        digest: DigestAlgo,
    },
    UploadMetadata {
        id: u64,
        creator: ActorId,
        digest: DigestAlgo,
        cate: ResourceCate,
    },
    AgreeOnContract {
        id: u64,
        signer: ActorId,
    },
    AbrogateContract {
        id: u64,
        sender: ActorId,
    },
    TransferOwner {
        old: ActorId,
        new: ActorId,
    },
}

#[derive(Debug, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct DeSignerInitParams {
    pub owner: ActorId,
}

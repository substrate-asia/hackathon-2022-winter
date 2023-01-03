use crate::io::DeSignerEvent;
use crate::page::{PageParam, PageRet};
use alloc::collections::btree_map::Entry;
use gstd::{exec, msg, prelude::*, ActorId, MessageId};

#[derive(Debug, Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ResourceCate {
    // main sign file, like xx.pdf
    MainFile,
    // other files
    Attachment,
    // metadata in file
    FileMetadata,
    // sign metadata, like digital sign in contract
    SignMetadata,
    // Abrogate metadata
    AbrogateMetadata,
}

#[derive(Debug, Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum DigestAlgo {
    SHA256(String),
}

#[derive(Debug, Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct ResourceParam {
    pub digest: DigestAlgo,
    pub url: String,
    pub memo: Option<String>,
}

#[derive(Debug, Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct Resource {
    digest: DigestAlgo,
    url: String,
    memo: Option<String>,
    cate: ResourceCate,
    creator: ActorId,
    creat_at: u64,
}

#[derive(Debug, Encode, Decode, TypeInfo, Clone, Eq, PartialEq)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum ContractStatus {
    Created,
    Signing,
    Sealed,
    Abrogated,
}

#[derive(Debug, Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct AgreeOnInfo {
    msg_id: MessageId,
    create_at: u64,
}

#[derive(Debug, Encode, Decode, TypeInfo, Clone)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct Contract {
    pub id: u64,
    creator: ActorId,
    creat_tx: MessageId,
    name: String,
    create_at: u64,
    expire: u64,
    status: ContractStatus,
    signers: Vec<ActorId>,
    agree_on: BTreeMap<ActorId, AgreeOnInfo>,
    file: Resource,
    other_res: BTreeMap<ActorId, Vec<Resource>>,
}

#[derive(Default)]
pub struct DeSignerState {
    owner: ActorId,
    index: u64,
    contract_map: BTreeMap<u64, Contract>,
    contract_map_by_creator: BTreeMap<ActorId, Vec<u64>>,
    contract_map_by_signer: BTreeMap<ActorId, Vec<u64>>,
}

impl DeSignerState {
    pub fn set_owner(&mut self, owner: ActorId) {
        self.owner = owner;
    }

    pub fn create_contract(
        &mut self,
        name: String,
        signers: Vec<ActorId>,
        res: ResourceParam,
        expire: u64,
        send_reply: bool,
    ) -> u64 {
        self.validate_great_than_block_timestamp(expire);
        self.validate_str(&name);
        self.validate_str(&res.url);
        self.validate_opt_str(res.memo.as_ref());

        let id = self.next_id();

        let creator = msg::source();
        let file = Resource {
            digest: res.digest.clone(),
            url: res.url,
            memo: res.memo,
            cate: ResourceCate::MainFile,
            creator,
            creat_at: exec::block_timestamp(),
        };
        if self.contract_map.contains_key(&id) {
            panic!("wrong id");
        }
        self.contract_map_by_creator
            .entry(creator)
            .or_insert(vec![])
            .push(id);
        for signer in signers.iter() {
            self.contract_map_by_signer
                .entry(*signer)
                .or_insert(vec![])
                .push(id);
        }
        self.contract_map.insert(
            id,
            Contract {
                id,
                creator,
                creat_tx: msg::id(),
                name: name.clone(),
                create_at: exec::block_timestamp(),
                expire,
                status: ContractStatus::Created,
                signers,
                agree_on: Default::default(),
                file,
                other_res: Default::default(),
            },
        );
        if send_reply {
            msg::reply(
                DeSignerEvent::CreateContract {
                    id,
                    name,
                    creator,
                    digest: res.digest,
                },
                0,
            )
            .unwrap();
        }
        id
    }

    pub fn create_contract_with_agree(
        &mut self,
        name: String,
        signers: Vec<ActorId>,
        file: ResourceParam,
        expire: u64,
        resource: Option<ResourceParam>,
    ) {
        let id = self.create_contract(name, signers, file, expire, false);
        self.agree_on_contract(id, resource);
    }

    pub fn upload_attachment(&mut self, id: u64, res: ResourceParam) {
        self.validate_str(&res.url);
        self.validate_opt_str(res.memo.as_ref());
        self.validate_contract_status(id, ContractStatus::Created);
        self.validate_contract_expire(id);
        self.validate_contract_singer(id);

        let contract = match self.contract_map.entry(id) {
            Entry::Occupied(entry) => entry.into_mut(),
            Entry::Vacant(_) => panic!("not found contract"),
        };

        let sender = msg::source();
        if !contract.signers.contains(&sender) {
            panic!("not found signer")
        }
        let attachment = Resource {
            digest: res.digest.clone(),
            url: res.url,
            memo: res.memo,
            cate: ResourceCate::Attachment,
            creator: sender,
            creat_at: exec::block_timestamp(),
        };
        contract
            .other_res
            .entry(sender)
            .or_insert(vec![])
            .push(attachment);
        msg::reply(
            DeSignerEvent::UploadMetadata {
                id,
                creator: sender,
                digest: res.digest,
                cate: ResourceCate::Attachment,
            },
            0,
        )
        .unwrap();
    }

    pub fn upload_metadata(&mut self, id: u64, res: ResourceParam) {
        self.validate_str(&res.url);
        self.validate_opt_str(res.memo.as_ref());
        self.validate_contract_status(id, ContractStatus::Created);
        self.validate_contract_expire(id);
        self.validate_contract_singer(id);

        let contract = match self.contract_map.entry(id) {
            Entry::Occupied(entry) => entry.into_mut(),
            Entry::Vacant(_) => panic!("not found contract"),
        };
        let sender = msg::source();
        let metadata = Resource {
            digest: res.digest.clone(),
            url: res.url,
            memo: res.memo,
            cate: ResourceCate::FileMetadata,
            creator: sender,
            creat_at: exec::block_timestamp(),
        };
        contract
            .other_res
            .entry(sender)
            .or_insert(vec![])
            .push(metadata);
        msg::reply(
            DeSignerEvent::UploadMetadata {
                id,
                creator: sender,
                digest: res.digest,
                cate: ResourceCate::FileMetadata,
            },
            0,
        )
        .unwrap();
    }

    pub fn agree_on_contract(&mut self, id: u64, res: Option<ResourceParam>) {
        if let Some(resource) = res.as_ref() {
            self.validate_str(&resource.url);
            self.validate_opt_str(resource.memo.as_ref());
        }
        self.validate_contract_expire(id);
        self.validate_contract_singer(id);
        let contract = match self.contract_map.entry(id) {
            Entry::Occupied(entry) => entry.into_mut(),
            Entry::Vacant(_) => panic!("not found contract"),
        };

        // trigger signing when start sign
        if contract.status == ContractStatus::Created {
            contract.status = ContractStatus::Signing;
        }
        if contract.status != ContractStatus::Signing {
            panic!("not in correct status")
        }

        let sender = msg::source();
        if let Some(resource) = res {
            let metadata = Resource {
                digest: resource.digest.clone(),
                url: resource.url,
                memo: resource.memo,
                cate: ResourceCate::SignMetadata,
                creator: sender,
                creat_at: exec::block_timestamp(),
            };
            contract
                .other_res
                .entry(sender)
                .or_insert(vec![])
                .push(metadata);
        }

        if contract.agree_on.contains_key(&sender) {
            panic!("duplicated sign")
        }
        contract.agree_on.insert(
            sender,
            AgreeOnInfo {
                msg_id: msg::id(),
                create_at: exec::block_timestamp(),
            },
        );

        // if agree_on count equal to signers, trigger finished
        if contract.agree_on.len() == contract.signers.len() {
            contract.status = ContractStatus::Sealed;
        }

        msg::reply(DeSignerEvent::AgreeOnContract { id, signer: sender }, 0).unwrap();
    }

    pub fn abrogate_contract(&mut self, id: u64, res: ResourceParam) {
        self.validate_str(&res.url);
        self.validate_opt_str(res.memo.as_ref());
        self.validate_contract_expire(id);
        self.validate_contract_singer(id);

        let contract = match self.contract_map.entry(id) {
            Entry::Occupied(entry) => entry.into_mut(),
            Entry::Vacant(_) => panic!("not found contract"),
        };
        if contract.status != ContractStatus::Created && contract.status != ContractStatus::Signing
        {
            panic!("not in correct status")
        }
        let sender = msg::source();
        contract.status = ContractStatus::Abrogated;
        let resource = Resource {
            digest: res.digest.clone(),
            url: res.url,
            memo: res.memo,
            cate: ResourceCate::AbrogateMetadata,
            creator: sender,
            creat_at: exec::block_timestamp(),
        };
        contract
            .other_res
            .entry(sender)
            .or_insert(vec![])
            .push(resource);

        msg::reply(DeSignerEvent::AbrogateContract { id, sender }, 0).unwrap();
    }

    pub fn transfer_owner(&mut self, owner: ActorId) {
        self.validate_only_owner();
        let old = self.owner;
        self.set_owner(owner);
        msg::reply(DeSignerEvent::TransferOwner { old, new: owner }, 0).unwrap();
    }

    pub fn owner(&self) -> ActorId {
        self.owner
    }

    pub fn index(&self) -> u64 {
        self.index
    }

    pub fn query_contract_by_creator(&self, param: PageParam, addr: ActorId) -> PageRet<Contract> {
        if let Some(id_list) = self.contract_map_by_creator.get(&addr) {
            let total = id_list.len() as u64;
            let (start, end) = param.find_index(total);
            let mut res = Vec::with_capacity((end - start) as usize);
            for i in start..end {
                let contract = self
                    .contract_map
                    .get(&id_list[i as usize])
                    .expect("not found contract");
                res.push((*contract).clone())
            }
            PageRet::new(param, total, res)
        } else {
            PageRet::new(param, 0, Vec::new())
        }
    }

    pub fn query_contract_by_signer(&self, param: PageParam, addr: ActorId) -> PageRet<Contract> {
        if let Some(id_list) = self.contract_map_by_signer.get(&addr) {
            let total = id_list.len() as u64;
            let (start, end) = param.find_index(total);
            let mut res = Vec::with_capacity((end - start) as usize);
            for i in start..end {
                let contract = self
                    .contract_map
                    .get(&id_list[i as usize])
                    .expect("not found contract");
                res.push((*contract).clone())
            }
            PageRet::new(param, total, res)
        } else {
            PageRet::new(param, 0, Vec::new())
        }
    }
    pub fn query_contract_by_signer_and_status(
        &self,
        param: PageParam,
        addr: ActorId,
        statuses: Vec<ContractStatus>,
    ) -> PageRet<Contract> {
        if let Some(id_list) = self.contract_map_by_signer.get(&addr) {
            let mut filter_list = Vec::with_capacity(id_list.len());
            for i in id_list.iter().copied() {
                let contract = self
                    .contract_map
                    .get(&id_list[i as usize])
                    .expect("not found contract");
                if statuses.contains(&contract.status) {
                    filter_list.push(id_list[i as usize]);
                }
            }
            let total = filter_list.len() as u64;
            let (start, end) = param.find_index(total);
            let mut res = Vec::with_capacity((end - start) as usize);
            for i in start..end {
                let contract = self
                    .contract_map
                    .get(&filter_list[i as usize])
                    .expect("not found contract");
                res.push((*contract).clone())
            }
            PageRet::new(param, total, res)
        } else {
            PageRet::new(param, 0, Vec::new())
        }
    }

    pub fn query_contract_by_id(&self, param: u64) -> Contract {
        let contract = self.contract_map.get(&param).expect("not found contract");
        (*contract).clone()
    }

    fn next_id(&mut self) -> u64 {
        let (_, of) = self.index.overflowing_add(1);
        if of {
            panic!("index overflow")
        }

        let next = self.index;
        self.index += 1;
        next
    }

    fn validate_great_than_block_timestamp(&self, t: u64) {
        if t <= exec::block_timestamp() {
            panic!("input time too low")
        }
    }

    fn validate_str(&self, s: &String) {
        if s.len() > 512 {
            panic!("too much chars")
        }
        if s.trim().len() != s.len() {
            panic!("has whitespace in prefix or suffix")
        }
    }

    fn validate_opt_str(&self, s: Option<&String>) {
        match s {
            None => {}
            Some(s) => self.validate_str(s),
        }
    }

    fn validate_only_owner(&self) {
        if msg::source() != self.owner {
            panic!("Only owner can call it")
        }
    }

    fn validate_contract_status(&self, id: u64, status: ContractStatus) {
        let contract = self.contract_map.get(&id).expect("not found contract");
        if contract.status != status {
            panic!("not in correct status")
        }
    }

    fn validate_contract_expire(&self, id: u64) {
        let contract = self.contract_map.get(&id).expect("not found contract");
        if contract.expire <= exec::block_timestamp() {
            panic!("contract has expired")
        }
    }

    fn validate_contract_singer(&self, id: u64) {
        let contract = self.contract_map.get(&id).expect("not found contract");
        if !contract.signers.contains(&msg::source()) {
            panic!("not found signer")
        }
    }
}

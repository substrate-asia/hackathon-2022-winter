module NFTDataAddr::NFTDatas {

    struct NFTData has key, store {
        token_id:u64,
        level:u64,
        type:u64,
    }


    public fun save_data(account: &signer,token_id:u64, level: u64, type: u64){
        move_to(account, NFTData{token_id,level:level, type:type});
    }

    public(script) fun save_nft_data(account: signer,token_id:u64, level: u64, type: u64) {
        Self::save_data(&account,token_id, level, type)
    }
}
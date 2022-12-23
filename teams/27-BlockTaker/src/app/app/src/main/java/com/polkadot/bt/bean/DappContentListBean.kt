package com.polkadot.bt.bean

data class DappContentListBean(
    val count: Int,
    val list: ArrayList<DappContentBean>
)

data class DappContentBean(
    val content_id: Int = -1,
    val created_at: Int = -1,
    val title: String = "",
    val desc: String = "",
    val icon: String = "",
    val id: Int = -1,
    val sort: Int = -1,
    val state_line: Int = -1,
    val type: Int = -1,
    val link: String = "",
    var image: String = ""
)
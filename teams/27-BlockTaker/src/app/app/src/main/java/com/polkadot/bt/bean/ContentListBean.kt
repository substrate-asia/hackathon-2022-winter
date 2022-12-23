package com.polkadot.bt.bean

/**
 * @author Heaven
 * @date 2022/9/14 10:20
 */
data class ContentListBean(
    val count: Int,
    val image_prefix: String,
    val list: MutableList<ContentBean>
)

data class ContentBean(
    val content_id: Int,
    var content_image: String? = null,
    val content_title: String,
    val created_at: Int,
    val desc: String,
    val id: Int,
    var image: String? = null,
    val sort: Int,
    val state_line: Int,
    val sub_title: String,
    val title: String,
    val url: String,
)
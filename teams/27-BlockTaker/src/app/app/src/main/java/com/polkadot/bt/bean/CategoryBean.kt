package com.polkadot.bt.bean

/**
 * @author Heaven
 * @date 2022/9/14 10:12
 */
data class CategoryListBean(
    val image_prefix: String,
    val list: List<CategoryBean>
)

data class CategoryBean(
    val category_id: Int,
    val corp_id: Int,
    val created_at: Int,
    val default_type: Int,
    val desc: String,
    var icon: String? = null,
    val id: Int,
    val key: String,
    val name: String,
    val parent_id: Int,
    val region_id: Int,
    val service_id: Int,
    val title: String,
    val top_id: Int,
    val type: Int,
)
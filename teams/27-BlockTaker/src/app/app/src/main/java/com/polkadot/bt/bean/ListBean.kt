package com.polkadot.bt.bean

data class ListBean(
    var count:Int=0,
    var list:List<LinkBean>?=null

)

data class ListBeanByMore(
    var count:Int=0,
    var list:List<CurrencyBean>?=null
)

data class LinkBean(
    var id:Int,
    var name:String,
    var desc:String,
    var hot_list:List<CurrencyBean>,
    var isHaseMore:Boolean=false
)

data class CurrencyBean(
    val id:Int,
//    val current_price:String,
    var name:String,
    var symbol:String,
    var address:String,
    var decimals:Int,
    var logo_url:String,
    var channel:String

)

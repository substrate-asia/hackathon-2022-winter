package com.polkadot.bt.net

import com.polkadot.bt.bean.*
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*


interface CenterApi {

    @GET("api2/1/ticker/{link}_usdt")
    suspend fun getEthPrice(@Path("link") link: String): UnitPriceBean

    /*
    * 获取当前汇率
    * */
    @GET("rates")
    suspend fun getRate(): ListRateBean

    /*
    * 添加币种，获取所有的币种
    * */
    @GET("coins")
    suspend fun getMoreLinks(
        @Query("page") page: Int = 1,
        @Query("max") max: Int = 100,
        @Query("channel") channel: String,
        @Query("name") name: String = "",
        @Query("start") start: Int = 0

    ): ListBeanByMore

    /*
    * 添加币种，获取所有的币种
    * */
    @GET("channel/coins/hots")
    suspend fun getHotCurrency(
        @Query("limit") limit: Int = 8
    ): ListBean

    /*
    * 添加币种，获取所有的币种
    * */
    @GET("channel/coins/home")
    suspend fun searchCurrency(
        @Query("limit") limit: Int = 5,
        @Query("name") name: String
    ): ListBean


    /*获取币种单个价格*/
    @GET("coin/code/{link}")
    suspend fun getPrice(@Path("link") link: String): UnitPriceBean


    /*获取历史记录ETH 历史记录*/
    @GET("api")
    suspend fun getHistory(
        @Query("module") module: String = "account",
        @Query("action") action: String = "tokentx",
        @Query("contractaddress") contractaddress: String = "",
        @Query("address") address: String,
        @Query("startblock") startblock: Int = 0,
        @Query("endblock") endblock: Long = 99999999,
        @Query("page") page: Int = 1,
        @Query("offset") offset: Int = 20,
        @Query("sort") sort: String = "asc",
        @Query("apikey") apikey: String = "",
    ): HistoryBean

    /*获取历史记录DOT 历史记录*/
    @POST("api/scan/transfers")
    suspend fun getDOTHistory(
        @Header("X-API-Key") apikey: String,
        @Body requestBody: RequestBody,
    ): HistoryBeanDot

    /*
    * 获取BTC gas费
    * */
    @GET("api/v1/fees/recommended")
    suspend fun getBTCGasPrice(): BtcGasPrice

    /*
    * 获取当前链支持闪兑的代币
    * */
    @GET("{type}/tokens")
    suspend fun swapTokens(@Path("type") type: Int): ListToken

    /*
    * 闪兑预估
    * */
    @GET("{type}/quote")
    suspend fun quote(
        @Path("type") type: Int,
        @Query("fromTokenAddress") fromTokenAddress: String,
        @Query("toTokenAddress") toTokenAddress: String,
        @Query("amount") amount: String = "1",
    ): SwapBean

    /*
    *
    * 执行闪兑
    * */
    @GET("{type}/swap")
    suspend fun swap(
        @Path("type") type: Int,
        @Query("fromTokenAddress") fromTokenAddress: String,
        @Query("toTokenAddress") toTokenAddress: String,
        @Query("amount") amount: String,
        @Query("fromAddress") fromAddress: String,
        @Query("slippage") slippage: Int  //1-50
    ): SwapBean


    /*@GET("service/dapp/feature/banner/content")
    suspend fun banner(): Response<ContentListBean>

    @GET("service/dapp/feature/hot/content")
    suspend fun hot(): Response<ContentListBean>

    @GET("service/dapp/category/default/child")
    suspend fun category(): Response<CategoryListBean>

    @GET("service/dapp/category/{id}/content")
    suspend fun categoryContent(
        @Path("id") id: Int,
    ): Response<ContentListBean>

    @FormUrlEncoded
    @POST("service/dapp/content")
    suspend fun query(
        @Field("keyword") keyword: String,
        @Query("page") page: Int,
        @Query("max") max: Int = 20,
    ) : Response<ContentListBean>*/


    @GET("banner")
    suspend fun dappBanner(): Response<DappContentListBean>

    @GET("series")
    suspend fun series(): Response<DappContentListBean>

    @GET("category")
    suspend fun category(): Response<DappContentListBean>

    @GET("series/{id}/app")
    suspend fun seriesList(
        @Path("id") id: Int,
        @Query("type") type: Int = 2,
    ): Response<DappContentListBean>

    @GET("category/{id}/app")
    suspend fun categoryContent(
        @Path("id") id: Int,
        @Query("type") type: Int = 2,
        @Query("page") page: Int = 1,
        @Query("max") max: Int = 1000,
    ): Response<DappContentListBean>

    @GET("app")
    suspend fun query(
        @Query("title") title: String,
        @Query("page") page: Int,
        @Query("max") max: Int = 20
    ): Response<DappContentListBean>

    @GET("polkdot/v1/validators")
    suspend fun getPolkadotValidators(
        @Query("balance") balance: String,
    ): Response<PolkadotValidatorsResult>

    @POST("operate/v1/save_nominator")
    suspend fun saveNominator(
        @Body requestBody: RequestBody,
    ): Response<PolkadotValidatorsResult>

    @GET("operate/v1/cancel_nominator")
    suspend fun cancelnominator(
        @Query("stash_address") balance: String,
    ): Response<PolkadotValidatorsResult>

    @POST("staking/v1/save")
    suspend fun saveRetrievableAmout(
        @Body requestBody: RequestBody,
    ): Response<PolkadotValidatorsResult>

    @GET("staking/v1/del_amount")
    suspend fun deleteRetrievableAmout(
        @Query("stash_address") balance: String,
    ): Response<PolkadotValidatorsResult>

    @GET("staking/v1/get_amount")
    suspend fun getRetrievableAmount(
        @Query("stash_address") balance: String,
    ): Response<RetrievableAmountResult>

}
package com.polkadot.bt.net

import com.polkadot.bt.App
import com.polkadot.bt.BuildConfig
import com.polkadot.bt.bean.UpgradeBean
import com.polkadot.bt.ext.Utils
import retrofit2.Response
import retrofit2.http.FieldMap
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST
import retrofit2.http.Path


interface AppUpdateApi {
    @FormUrlEncoded
    @POST("check/{channelID}")
    suspend fun update(
        @Path("channelID") channelID: Int = BuildConfig.CHANNEL_ID,    // 渠道
        @FieldMap map: Map<String, String> = Utils.getDeviceRelatedParamMap(App.context)
    ): Response<UpgradeBean?>
}
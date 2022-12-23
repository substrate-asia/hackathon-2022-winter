package com.polkadot.bt.net

import android.annotation.SuppressLint
import androidx.lifecycle.LifecycleCoroutineScope
import com.polkadot.bt.App
import com.polkadot.bt.BuildConfig
import com.polkadot.bt.ext.Utils
import kotlinx.coroutines.*
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.ResponseBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Converter
import retrofit2.HttpException
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.File
import java.io.InputStream
import java.lang.reflect.Type
import java.util.concurrent.TimeUnit

object HttpUtils {
    @SuppressLint("ConstantLocale")
    val valueApi = Retrofit.Builder()
        .baseUrl("https://data.gateapi.io/")
        .client(
            OkHttpClient.Builder()
                .connectTimeout(60, TimeUnit.SECONDS)
                . writeTimeout(60, TimeUnit.SECONDS)
                . readTimeout(60, TimeUnit.SECONDS)
                .addInterceptor(HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BODY))
                .build()
        )
        .addConverterFactory(NullOnEmptyConverterFactory())
        .addConverterFactory(GsonConverterFactory.create())
        .build().create(CenterApi::class.java)

    @SuppressLint("ConstantLocale")
    val appUpdateApi = Retrofit.Builder()
        .baseUrl(BuildConfig.UPDATE_URL)
        .client(
            OkHttpClient.Builder()
                .connectTimeout(60, TimeUnit.SECONDS)
                . writeTimeout(60, TimeUnit.SECONDS)
                . readTimeout(60, TimeUnit.SECONDS)
                .addInterceptor {
                    return@addInterceptor it.proceed(
                        it.request().newBuilder()
                            .addHeader("accept-language", Utils.getSystemLanguage(true))
                            .addHeader("DeviceModel", Utils.getDeviceModel())
                            .build()
                    )
                }
                .addInterceptor(HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BODY))
                .build()
        )
        .addConverterFactory(NullOnEmptyConverterFactory())
        .addConverterFactory(GsonConverterFactory.create())
        .build().create(AppUpdateApi::class.java)!!

    @SuppressLint("ConstantLocale")
    val linkApi = Retrofit.Builder()
        .baseUrl(BuildConfig.VALUE_URL)
        .client(
            OkHttpClient.Builder()
                .addInterceptor {
                    return@addInterceptor it.proceed(
                        it.request().newBuilder()
                            .addHeader("accept-language", Utils.getSystemLanguage(true))
                            .addHeader("DeviceModel", Utils.getDeviceModel())
                            .addHeader("corp", Utils.getCorp())
                            .build()
                    )
                }
                .addInterceptor(HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BODY))
                .build()
        )
        .addConverterFactory(NullOnEmptyConverterFactory())
        .addConverterFactory(GsonConverterFactory.create())
        .build().create(CenterApi::class.java)!!

    @SuppressLint("ConstantLocale")
    val dappApi = Retrofit.Builder()
        .baseUrl(BuildConfig.DAPP_URL)
        .client(
            OkHttpClient.Builder()
                .addInterceptor {
                    return@addInterceptor it.proceed(
                        it.request().newBuilder()
                            .addHeader("accept-language", Utils.getSystemLanguage(true))
                            .addHeader("DeviceModel", Utils.getDeviceModel())
                            .addHeader("corp", Utils.getCorp())
                            .build()
                    )
                }
                .addInterceptor(HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BODY))
                .build()
        )
        .addConverterFactory(NullOnEmptyConverterFactory())
        .addConverterFactory(GsonConverterFactory.create())
        .build().create(CenterApi::class.java)!!

    fun createApi(url:String): CenterApi {
        return Retrofit.Builder()
            .baseUrl(url)
            .client(
                OkHttpClient.Builder()
                    .addInterceptor(HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BODY))
                    .build()
            )
            .addConverterFactory(NullOnEmptyConverterFactory())
            .addConverterFactory(GsonConverterFactory.create())
            .build().create(CenterApi::class.java)
    }




    fun downloadFile(url: String, path: String, listener: (url: String, downloadedLen: Long, totalLen: Long, file: File?) -> Unit): Job {
        return GlobalScope.launch {
            val file = File(App.context.filesDir, "downloads/$path")
            if (!file.parentFile!!.exists())
                file.parentFile!!.mkdirs()
            if (file.exists())
                file.deleteRecursively()
            var inputStream: InputStream? = null
            val outputStream = file.outputStream()
            try {
                val request = Request.Builder().url(url).get().build()
                val response = OkHttpClient().newCall(request).execute()
                inputStream = response.body?.byteStream()
                val fileLen = response.body?.contentLength()?.let { len ->
                    if (len == -1L)
                        (response.headers["Content-Range"])?.split("/")?.get(1)?.toLong() ?: 0L
                    else
                        len
                } ?: 0
                val buff = ByteArray(10240)
                var len = 0
                var downloadedLen = 0L
                while (inputStream?.read(buff)?.also { len = it } ?: -2 > -1 && isActive) {
                    outputStream.write(buff, 0, len)
                    downloadedLen += len
                    listener(url, downloadedLen, fileLen, file)
                }
                if (downloadedLen != fileLen)
                    listener(url, -1L, -1L, null)
            } catch (e: HttpException) {
                e.printStackTrace()
                listener(url, -1L, e.code().toLong(), null)
            } catch (e: Exception) {
                e.printStackTrace()
                listener(url, -1L, 0L, null)
            } finally {
                outputStream.close()
                inputStream?.close()
            }
        }
    }

    /**
     * 解决返回body为空的情况下GsonConverterFactory报错的问题
     */
    class NullOnEmptyConverterFactory : Converter.Factory() {
        override fun responseBodyConverter(type: Type, annotations: Array<Annotation>, retrofit: Retrofit): Converter<ResponseBody, *> {
            val delegate = retrofit.nextResponseBodyConverter<Any>(this, type, annotations)
            return Converter<ResponseBody, Any> { body ->
                val bytes = body.source().readByteArray()
                val contentLength = bytes.size
                val body2 = ResponseBody.create(body.contentType(), bytes)
                if (contentLength == 0) {
                    null
                } else delegate.convert(body2)
            }
        }
    }


    fun doHttp(scope: CoroutineScope, run: suspend () -> Unit, error: ((e: Exception) -> Unit)? = null): Job {
        return scope.launch {
            try {
                run()
            } catch (e: Exception) {
                e.printStackTrace()
                error?.invoke(e)
            }
        }
    }

    fun doHttp(run: suspend () -> Unit, error: ((e: Exception) -> Unit)?): Job {
        return doHttp(MainScope(), run, error)
    }

    fun doHttp(run: suspend () -> Unit): Job {
        return doHttp(run, null)
    }

    fun LifecycleCoroutineScope.doHttp(run: suspend () -> Unit, error: ((e: Exception) -> Unit)? = null) = doHttp(this, run, error)
    fun LifecycleCoroutineScope.doHttp(run: suspend () -> Unit) = doHttp(this, run)
}
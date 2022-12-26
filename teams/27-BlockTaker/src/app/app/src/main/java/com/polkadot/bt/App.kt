package com.polkadot.bt

import android.app.Activity
import android.app.Application
import android.os.Bundle
import com.scwang.smart.refresh.footer.ClassicsFooter
import com.scwang.smart.refresh.header.MaterialHeader
import com.scwang.smart.refresh.layout.SmartRefreshLayout
import com.scwang.smart.refresh.layout.listener.DefaultRefreshHeaderCreator
import com.polkadot.bt.ext.ActivityManager
import retrofit2.Retrofit


/**
 * @author Heaven
 * @date 2022/8/3 16:32
 */
class App : Application() {
    var retrofit:Retrofit?=null
    companion object {
        @JvmStatic
        lateinit var context: App
            private set
    }

    init {
        //设置全局的Header构建器
        SmartRefreshLayout.setDefaultRefreshHeaderCreator(DefaultRefreshHeaderCreator { context, layout ->
            layout.setPrimaryColorsId(R.color.white, R.color.white) //全局设置主题颜色
            MaterialHeader(context)
        })
        //设置全局的Footer构建器
        SmartRefreshLayout.setDefaultRefreshFooterCreator { context, _ -> //指定为经典Footer，默认是 BallPulseFooter
            ClassicsFooter(context)
        }


        /**
         * 对于7.0以下，需要在Application创建的时候进行语言切换
         */
        /*val language = MySharedPreferences.get("language",0)
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            changeAppLanguage(context, language)
        }*/
    }

    override fun onCreate() {
        super.onCreate()
        context = this

        // 监听所有Activity的生命周期回调
        registerActivityLifecycleCallbacks(object :ActivityLifecycleCallbacks{
            override fun onActivityCreated(p0: Activity, p1: Bundle?) {
                ActivityManager.add(p0)
            }

            override fun onActivityStarted(p0: Activity) {
            }

            override fun onActivityResumed(p0: Activity) {
                ActivityManager.setCurrentActivity(p0)
            }

            override fun onActivityPaused(p0: Activity) {
            }

            override fun onActivityStopped(p0: Activity) {
            }

            override fun onActivitySaveInstanceState(p0: Activity, p1: Bundle) {
            }

            override fun onActivityDestroyed(p0: Activity) {
                ActivityManager.remove(p0)
            }

        })
    }
}
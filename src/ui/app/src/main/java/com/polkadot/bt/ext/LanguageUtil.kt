package com.polkadot.bt.ext

import android.annotation.TargetApi
import android.content.Context
import android.content.res.Configuration
import android.content.res.Resources
import android.os.Build
import android.os.LocaleList
import android.util.DisplayMetrics
import java.util.*


object LanguageUtil {


    /**
     * @param context
     * @param newLanguage 想要切换的语言类型 比如 "en-us" ,"zh-cn","zh-tw"
     */
    fun changeAppLanguage(context: Context, newLanguage: String) {

        val resources: Resources = context.resources
        val configuration: Configuration = resources.configuration
        //获取想要切换的语言类型
       /* val locale: Locale? =when(newLanguage){
            0->Locale.SIMPLIFIED_CHINESE
            1->Locale.ENGLISH
            2->Locale.TRADITIONAL_CHINESE
            else->null
        }*/
        val locale=Locale(newLanguage.split("-")[0],newLanguage.split("-")[1])

        configuration.setLocale(locale)
        // updateConfiguration
        val dm: DisplayMetrics = resources.displayMetrics
        resources.updateConfiguration(configuration, dm)
    }

    fun attachBaseContext(context: Context,language: String): Context? {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            updateResources(context, language)
        } else {
            context
        }
    }

    @TargetApi(Build.VERSION_CODES.N)
    private fun updateResources(context: Context, language: String): Context? {

        val resources = context.resources
      /*  val locale: Locale? =when(language){
            0->Locale.SIMPLIFIED_CHINESE
            1->Locale.ENGLISH
            2->Locale.TRADITIONAL_CHINESE
            else->null
        }*/

        val locale=Locale(language.split("-")[0],language.split("-")[1])
        val configuration = resources.configuration
            configuration.setLocale(locale)
            configuration.setLocales(LocaleList(locale))
        return context.createConfigurationContext(configuration)
    }

     fun getSystem(context: Context):Int{
         val locale = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N)
             LocaleList.getDefault()[0]
         else
             Locale.getDefault()

        val language =when(locale){
            Locale.SIMPLIFIED_CHINESE->1
            Locale.TRADITIONAL_CHINESE->2
            else->{
                if (locale.language.startsWith("en"))
                  0  else 0
            }
        }
        return language
    }

}
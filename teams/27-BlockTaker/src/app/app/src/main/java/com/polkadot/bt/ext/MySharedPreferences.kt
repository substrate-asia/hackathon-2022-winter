package com.polkadot.bt.ext

import android.annotation.SuppressLint
import android.content.Context
import com.google.gson.Gson
import com.polkadot.bt.App

@Suppress("UNCHECKED_CAST", "IMPLICIT_CAST_TO_ANY")
@SuppressLint("ApplySharedPref")
class MySharedPreferences {
    companion object {
        private val sharedPreferences = App.context.getSharedPreferences("value_db", Context.MODE_PRIVATE)
        val gson = Gson()

        fun clear() {
            sharedPreferences.edit().clear().commit()
        }

        fun <T> put(key: String, value: T) {
            when (value) {
                is Boolean -> sharedPreferences.edit().putBoolean(key, value).commit()
                is Int -> sharedPreferences.edit().putInt(key, value).commit()
                is Long -> sharedPreferences.edit().putLong(key, value).commit()
                is Float -> sharedPreferences.edit().putFloat(key, value).commit()
                is String -> sharedPreferences.edit().putString(key, value).commit()
                else -> sharedPreferences.edit().putString(key, gson.toJson(value)).commit()
            }
        }

        fun <T> get(key: String, defaultValue: T): T {
            return when (defaultValue) {
                is Boolean -> sharedPreferences.getBoolean(key, defaultValue)
                is Int -> sharedPreferences.getInt(key, defaultValue)
                is Long -> sharedPreferences.getLong(key, defaultValue)
                is Float -> sharedPreferences.getFloat(key, defaultValue)
                is String -> sharedPreferences.getString(key, defaultValue)
                else -> sharedPreferences.getString(key, null)?.let { gson.fromJson(it, defaultValue!!::class.java) } ?: defaultValue
            } as T
        }

        fun contains(key: String): Boolean {
            return sharedPreferences.contains(key)
        }

        fun getString(key: String, defaultValue: String? = null): String? = sharedPreferences.getString(key, defaultValue)
        fun remove(key: String) = sharedPreferences.edit().remove(key).commit()
        fun getBoolean(key: String, defaultValue: Boolean? = null): Boolean? {
            return if (sharedPreferences.contains(key))
                sharedPreferences.getBoolean(key, false)
            else
                defaultValue
        }

    }

}

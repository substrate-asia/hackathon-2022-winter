package com.polkadot.bt.ext

import android.util.Log
import com.polkadot.bt.BuildConfig

/**
 * @author Heaven Created on 2022/6/22
 */

const val TAG = BuildConfig.APPLICATION_ID

private enum class LEVEL {
    V, D, I, W, E
}

fun Any.v(tag: String = TAG) = log(LEVEL.V, tag, this)

fun Any.d(tag: String = TAG) = log(LEVEL.D, tag, this)

fun Any.i(tag: String = TAG) = log(LEVEL.I, tag, this)

fun Any.w(tag: String = TAG) = log(LEVEL.W, tag, this)

fun Any.e(tag: String = TAG) = log(LEVEL.E, tag, this)

private fun log(level: LEVEL, tag: String, message: Any) {
    if (!BuildConfig.DEBUG) return
    when (level) {
        LEVEL.V -> Log.v(tag, message.toString())
        LEVEL.D -> Log.d(tag, message.toString())
        LEVEL.I -> Log.i(tag, message.toString())
        LEVEL.W -> Log.w(tag, message.toString())
        LEVEL.E -> Log.e(tag, message.toString())
    }
}
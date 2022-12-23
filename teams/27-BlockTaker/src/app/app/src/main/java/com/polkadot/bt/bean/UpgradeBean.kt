package com.polkadot.bt.bean

import java.io.Serializable

class UpgradeBean :Serializable {
    enum class DownloadStatus {
        NOT_START, DOWNLOADING, PAUSE, FINISH, FAILED
    }

    var name: String? = null
    var version: String? = null
    var code: Int = 0
    var size: Long = 0
    var file: String? = null
    var md5: String? = null
    var desc: String? = null
    var create_time: Long = 0
    var host: String? = null
    var force: Int = 0
    var icon: String? = null

    var status = DownloadStatus.NOT_START.ordinal
    var Progress: Int = 0
    var Length: Long = 0


}
package com.reactnativeawesomemodule

import android.app.Application
import android.content.Context
import android.media.AudioManager
import android.media.AudioManager.*
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import gcore.videocalls.meet.GCoreMeet
import gcore.videocalls.meet.localuser.LocalUserInfo
import gcore.videocalls.meet.model.DEFAULT_LENGTH_RANDOM_STRING
import gcore.videocalls.meet.model.UserRole
import gcore.videocalls.meet.room.RoomParams
import gcore.videocalls.meet.utils.Utils


class GCMeetService(
  private val application: Application,
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  init {
    runOnUiThread {
      GCoreMeet.instance.init(application)
    }
  }

  @ReactMethod
  fun closeConnection() {
    runOnUiThread {
      GCoreMeet.instance.close()
    }
  }

  @ReactMethod
  fun disableAudio() {
    GCoreMeet.instance.localUser?.toggleMic(false)
  }

  @ReactMethod
  fun disableVideo() {
    GCoreMeet.instance.localUser?.toggleCam(false)
  }

  @ReactMethod
  fun enableAudio() {
    GCoreMeet.instance.localUser?.toggleMic(true)
  }

  @ReactMethod
  fun enableVideo() {
    GCoreMeet.instance.localUser?.toggleCam(true)
  }

  @ReactMethod
  fun flipCamera() {
    GCoreMeet.instance.localUser?.flipCam()
  }

  @ReactMethod
  fun openConnection(options: ReadableMap) {
    runOnUiThread {

      val userRole = when (options.getString("role") ?: "") {
        "common" -> UserRole.COMMON
        "moderator" -> UserRole.MODERATOR
        else -> UserRole.UNKNOWN
      }
      val userInfo = LocalUserInfo(
        displayName = options.getString("displayName") ?: "User${Utils.getRandomString(3)}",
        role = userRole,
        userId = options.getString("userId") ?: Utils.getRandomString(DEFAULT_LENGTH_RANDOM_STRING)
      )

      val roomParams = RoomParams(
        roomId = options.getString("roomId") ?: "",
        hostName = options.getString("clientHostName") ?: "",
        startWithCam = options.getBoolean("isVideoOn"),
        startWithMic = options.getBoolean("isAudioOn")
      )

      GCoreMeet.instance.setConnectionParams(userInfo, roomParams)
      GCoreMeet.instance.connect()
    }
  }

  override fun getName(): String {
    return "GCMeetService"
  }

}

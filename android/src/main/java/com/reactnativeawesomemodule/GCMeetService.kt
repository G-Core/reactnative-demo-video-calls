package com.reactnativeawesomemodule

import android.app.Application
import android.content.Context
import android.media.AudioManager
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import gcore.videocalls.meet.GCoreMeet
import gcore.videocalls.meet.localuser.LocalUserInfo
import gcore.videocalls.meet.model.DEFAULT_LENGTH_RANDOM_STRING
import gcore.videocalls.meet.model.UserRole
import gcore.videocalls.meet.network.ConnectionState
import gcore.videocalls.meet.room.RoomParams
import gcore.videocalls.meet.utils.Utils


class GCMeetService(
  private val reactContext: ReactApplicationContext,
  private val application: Application
) : ReactContextBaseJavaModule(reactContext) {

  private var enableCamOnConnect = false
  private var enableMicOnConnect = false

  override fun getName(): String {
    return "GCMeetService"
  }

  init {
    runOnUiThread {
      GCoreMeet.instance.init(application)
    }
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
//        startWithCam = options.getBoolean("isVideoOn"),
//        startWithMic = options.getBoolean("isAudioOn")
      )

      enableCamOnConnect = options.getBoolean("isVideoOn")
      enableMicOnConnect = options.getBoolean("isAudioOn")

      GCoreMeet.instance.setConnectionParams(userInfo, roomParams)
      GCoreMeet.instance.connect(reactContext)

      val audioManager: AudioManager =
        reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager

      audioManager.isSpeakerphoneOn = true

      if (enableCamOnConnect || enableMicOnConnect) {
        GCoreMeet.instance.room.provider.roomInfo.observeForever {
          if (it.connectionState == ConnectionState.CONNECTED) {
            if (enableCamOnConnect) {
              enableVideo()
              enableCamOnConnect = false
              Log.d("Local", "enableVideo")
            }
            if (enableMicOnConnect) {
              enableAudio()
              enableMicOnConnect = false
            }
          }
        }
      }

    }
  }

  @ReactMethod
  fun closeConnection() {
    runOnUiThread {
      GCoreMeet.instance.close()
    }
  }

  @ReactMethod
  fun enableVideo() {
    GCoreMeet.instance.localUser?.toggleCam(true)
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
  fun disableAudio() {
    GCoreMeet.instance.localUser?.toggleMic(false)
  }

  @ReactMethod
  fun flipCamera() {
    GCoreMeet.instance.localUser?.flipCam()
  }
}

package com.reactnativeawesomemodule

import android.app.Application
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import gcore.videocalls.meet.GCoreMeet

class GCMeetService(val reactContext: ReactApplicationContext, private val application: Application) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "GCMeetService";
  }

  init {
    runOnUiThread {
      GCoreMeet.instance.init(application, null, false)
    }
  }

  @ReactMethod
  fun openConnection(roomOptions: ReadableMap) {
    runOnUiThread {
      GCoreMeet.instance.roomManager.roomId = roomOptions.getString("roomId") ?: ""
      GCoreMeet.instance.roomManager.displayName = roomOptions.getString("displayName") ?: ""
      GCoreMeet.instance.roomManager.isModer = roomOptions.getBoolean("isModerator")

      GCoreMeet.instance.startConnection(reactContext)

      GCoreMeet.instance.roomManager.options.startWithCam = roomOptions.getBoolean("isVideoOn")
      GCoreMeet.instance.roomManager.options.startWithMic = roomOptions.getBoolean("isAudioOn")

      if(GCoreMeet.instance.roomManager.isClosed())
        GCoreMeet.instance.roomManager.join()
    }
  }

  @ReactMethod
  fun closeConnection() {
    runOnUiThread {
      GCoreMeet.instance.roomManager.destroyRoom()
    }
  }

  @ReactMethod
  fun enableVideo() {
    GCoreMeet.instance.roomManager.enableCam()
  }

  @ReactMethod
  fun disableVideo() {
    GCoreMeet.instance.roomManager.disableCam()
  }

  @ReactMethod
  fun toggleVideo() {
    GCoreMeet.instance.roomManager.disableEnableCam()
  }

  @ReactMethod
  fun enableAudio() {
    if(!GCoreMeet.instance.roomManager.isMicEnabled())
      GCoreMeet.instance.roomManager.enableMic()

    GCoreMeet.instance.roomManager.unmuteMic()
  }

  @ReactMethod
  fun disableAudio() {
    GCoreMeet.instance.roomManager.muteMic()
  }

  @ReactMethod
  fun toggleAudio() {
    if(!GCoreMeet.instance.roomManager.isMicEnabled())
      GCoreMeet.instance.roomManager.enableMic()

    GCoreMeet.instance.roomManager.muteUnMuteMic()
  }

  @ReactMethod
  fun toggleCamera() {
    GCoreMeet.instance.roomManager.changeCam()
    Log.d("qwe", "toggle cam")
  }
}

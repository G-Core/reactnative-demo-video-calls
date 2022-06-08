package com.reactnativeawesomemodule
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log
import gcore.videocalls.meet.room.RoomOptions

class GCMeetService(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private var client: GCoreRoomClient? = null
  lateinit private var joinOptions: ConnectionOptions
  private var isConnectedOppoennt = false

  override fun getName(): String {
    return "GCMeetService";
  }

  @ReactMethod
  fun openConnection(roomOptions: NSDictionary) {
    GCoreRoomLogger.activateLogger()
    GCoreRoomLogger.log = { message  ->
      print(message)
    }
    print(roomOptions)
    val options = RoomOptions(cameraPosition: .front);

    val parameters = MeetRoomParametrs(
      roomId = roomOptions["roomId"] as String,
      displayName = roomOptions["displayName"] as String,
      clientHostName = roomOptions["clientHostName"] as? String,
      isModerator = roomOptions["isModerator"] as Boolean
    )
    joinOptions = ConnectionOptions(
      isVideoOn = roomOptions["isVideoOn"] as Boolean,
      isAudioOn = roomOptions["isAudioOn"] as Boolean,
      roomId = roomOptions["roomId"] as String,
      displayName = roomOptions["displayName"] as String,
      clientHostName = roomOptions["clientHostName"] as String,
      blurSigma = roomOptions["blurSigma"] as Double
    )
    client = GCoreRoomClient(roomOptions = options, requestParameters = parameters, roomListener = this)
    client?.setBufferDelegate(this)
    try { client?.open() } catch (e: Throwable) { null }
    client?.audioSessionActivate()
  }


  @ReactMethod
  fun closeConnection() {
    client?.close()
  }

  @ReactMethod
  fun enableVideo() {
    toggleVideo(true)
  }

  @ReactMethod
  fun disableVideo() {
    toggleVideo(false)
  }

  @ReactMethod
  fun toggleVideo(isOn: Boolean) {
    client?.toggleVideo(isOn = isOn)
    print("toggleVideo: ", isOn)
  }

  @ReactMethod
  fun enableAudio() {
    toggleAudio(true)
  }

  @ReactMethod
  fun disableAudio() {
    toggleAudio(false)
  }

  @ReactMethod
  fun toggleAudio(isOn: Boolean) {
    client?.toggleAudio(isOn = isOn)
    print("toggleAudio: ", isOn)
  }

  @ReactMethod
  fun toggleCamera() {
    client?.toggleCameraPosition(completion = { error  ->
      val error = error
      if (error != null) {
        debugPrint(error)
      }
    })
  }

  override fun supportedEvents() : List<String> =
    listOf()

  @ReactMethod
  override fun constantsToExport() : Map<AnyHashable, Any> =
    mapOf()

  @ReactMethod
  override fun requiresMainQueueSetup() : Boolean = true

}

package com.reactnativeawesomemodule

import android.app.Application
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import gcore.videocalls.meet.GCoreMeet
import gcore.videocalls.meet.localuser.LocalUserInfo
import gcore.videocalls.meet.model.DEFAULT_LENGTH_RANDOM_STRING
import gcore.videocalls.meet.model.UserRole
import gcore.videocalls.meet.network.client.VideoFrameListener
import gcore.videocalls.meet.room.RoomParams
import gcore.videocalls.meet.utils.Utils
import gcore.videocalls.meet.utils.image.VideoFrameConverter
import gcore.videocalls.meet.utils.image.VideoFrameFaceDetector
import gcore.videocalls.meet.utils.image.VideoFrameSegmenter
import org.webrtc.VideoFrame


class GCMeetService(
  reactContext: ReactApplicationContext,
  private val application: Application,
) : ReactContextBaseJavaModule(reactContext) {

  private val frameConverter = VideoFrameConverter(application)
  private val videoFrameFaceDetector = VideoFrameFaceDetector().also {
    it.faceDetectingFrameInterval = 10
  }
//  private val videoFrameSegmenter = VideoFrameSegmenter()

  private val videoFrameListener = object : VideoFrameListener {

    private var bgBitmap: Bitmap? = null
    private val planeLock = Any()

    private fun checkAndCreateBgBitmap(width: Int, height: Int): Bitmap {
      if (bgBitmap == null || bgBitmap!!.width != width || bgBitmap!!.height != height) {
        bgBitmap = Bitmap.createScaledBitmap(
          BitmapFactory.decodeResource(application.resources, R.drawable.bg), width, height, true
        )
      }

      return bgBitmap!!
    }

//    private fun applyBackground(frame: VideoFrame, sink: (frame: VideoFrame) -> Unit) {
//      val inputImage = frameConverter.frameToInputImage(frame, 0)
//      videoFrameSegmenter.getSegmentationMask(inputImage) { mask: SegmentationMask ->
//        val bgBitmap = checkAndCreateBgBitmap(frame.buffer.width, frame.buffer.height)
//
////      val bgFrame = frameConverter.applyBackgroundToFrame(frame, bgBitmap, mask)
//
//        val outBitmap = frameConverter.applyBackgroundToBitmap(inputImage.bitmapInternal!!, bgBitmap, mask)
//        val bgFrame = frameConverter.bitmapToFrame(outBitmap, frame.rotation, frame.timestampNs)
//
//        sink.invoke(bgFrame)
//
//        frame.buffer.release()
//      }
//    }

    override fun onFrameCaptured(frame: VideoFrame, sink: (frame: VideoFrame) -> Unit) {
      synchronized(planeLock) {
        frame.buffer.retain()
        val inputImage = frameConverter.frameToInputImage(frame, frame.rotation)
        val hasFace = videoFrameFaceDetector.hasFace(inputImage)

        val blurredFrame = if (hasFace) {
          frame
        } else {
          frameConverter.blurFrame(frame, 40)
        }

        sink.invoke(blurredFrame)
        frame.buffer.release()
      }
    }
  }

  init {

    runOnUiThread {
      GCoreMeet.instance.init(application)
    }

    GCoreMeet.instance.videoFrameListener = videoFrameListener
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

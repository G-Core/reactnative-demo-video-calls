package com.reactnativeawesomemodule
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log
import gcore.videocalls.meet.room.RoomOptions

class GCMeetPermissions(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "GCMeetPermissions";
  }

  @ReactMethod
  fun authorizeForVideo(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    switch AVCaptureDevice.authorizationStatus(for: .video) {
      case .notDetermined:
      AVCaptureDevice.requestAccess(for: .video) { granted in
        resolve(granted)
      }
      case .restricted:
      resolve(false)
      case .denied:
      resolve(false)
      case .authorized:
      resolve(true)
      @unknown default:
      resolve(false)
    }
  }

  @ReactMethod
  fun authorizeForAudio(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    switch AVCaptureDevice.authorizationStatus(for: .audio) {
      case .notDetermined:
      AVCaptureDevice.requestAccess(for: .audio) { granted in
        resolve(granted)
      }
      case .restricted:
      resolve(false)
      case .denied:
      resolve(false)
      case .authorized:
      resolve(true)
      @unknown default:
      resolve(false)
    }
  }

  @ReactMethod
  fun requiresMainQueueSetup() -> Bool {
    return true
  }

  @ReactMethod
  fun constantsToExport() -> [AnyHashable : Any]! {
    return [
      "isGrantedForAudio": AVCaptureDevice.authorizationStatus(for: .audio) == .authorized,
      "isGrantedForVideo": AVCaptureDevice.authorizationStatus(for: .video) == .authorized
    ]
  }


}

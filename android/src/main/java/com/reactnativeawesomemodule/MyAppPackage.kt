package com.reactnativeawesomemodule

import android.app.Application
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext

class MyAppPackage(private val application: Application) : ReactPackage {

  override fun createNativeModules(
    reactContext: ReactApplicationContext
  ): MutableList<NativeModule> = listOf(GCMeetService(reactContext, application)).toMutableList()

  override fun createViewManagers(
    reactContext: ReactApplicationContext
  ) = listOf(
    GCRemoteViewManager(reactContext),
    GCLocalViewManager(reactContext),
  ).toMutableList()

}

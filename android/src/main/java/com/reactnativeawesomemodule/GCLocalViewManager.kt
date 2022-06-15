package com.reactnativeawesomemodule

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import gcore.videocalls.meet.ui.view.me.LocalVideoTextureView

class GCLocalViewManager(var mCallerContext: ReactApplicationContext) :
  SimpleViewManager<LocalVideoTextureView>() {

  override fun getName(): String {
    return "GCLocalView"
  }

  override fun createViewInstance(reactContext: ThemedReactContext): LocalVideoTextureView {
    val view = LocalVideoTextureView(reactContext.baseContext)
    view.connect()
    return view

  }
}

package com.reactnativeawesomemodule

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import gcore.videocalls.meet.ui.view.me.LocalVideoTextureView

class GCLocalViewManager(var mCallerContext: ReactApplicationContext) :
  SimpleViewManager<LocalVideoTextureView>() {

  override fun getName(): String {
    return "GCLocalView"
  }

  override fun onDropViewInstance(view: LocalVideoTextureView) {
    Log.d("Local", "onDropViewInstance")
    view.release()
    super.onDropViewInstance(view)
  }


  override fun createViewInstance(reactContext: ThemedReactContext): LocalVideoTextureView {
    Log.d("Local", "createViewInstance")

    return LocalVideoTextureView(reactContext.baseContext)
  }
}

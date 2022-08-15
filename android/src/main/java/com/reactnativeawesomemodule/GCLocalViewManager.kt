package com.reactnativeawesomemodule

import android.os.Handler
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import gcore.videocalls.meet.GCoreMeet
import gcore.videocalls.meet.network.ConnectionState
import gcore.videocalls.meet.ui.view.me.LocalVideoSurfaceView
import gcore.videocalls.meet.ui.view.me.LocalVideoTextureView
import org.webrtc.ThreadUtils

class GCLocalViewManager(var mCallerContext: ReactApplicationContext) :
  SimpleViewManager<LocalVideoTextureView>() {

  override fun getName(): String {
    return "GCLocalView"
  }

  override fun onDropViewInstance(view: LocalVideoTextureView) {
    Log.d("Local", "onDropViewInstance")
    //view.disconnect()
    view.release()
    connected = false
    super.onDropViewInstance(view)
  }

  private var connected = false
  override fun createViewInstance(reactContext: ThemedReactContext): LocalVideoTextureView {
    Log.d("Local", "createViewInstance")

    val view = LocalVideoTextureView(reactContext.baseContext)
    // view.connect()
//
//    GCoreMeet.instance.room.provider.roomInfo.observeForever {
//      if(it.connectionState == ConnectionState.CONNECTED && !connected) {
//        Log.d("Local", "view connect")
//        connected = true
//
////        val handler = Handler()
////        handler.postDelayed({
////
////        }, 150)
//
//      }
//    }


    return view
  }
}

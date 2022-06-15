package com.reactnativeawesomemodule

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import gcore.videocalls.meet.GCoreMeet
import gcore.videocalls.meet.ui.view.peer.PeerVideoView

class GCRemoteViewManager(var mCallerContext: ReactApplicationContext) :
  SimpleViewManager<PeerVideoView>() {

  override fun getName(): String {
    return "GCRemoteView"
  }

  override fun createViewInstance(reactContext: ThemedReactContext): PeerVideoView {
    val view = PeerVideoView(reactContext.baseContext)
    GCoreMeet.instance.getPeers().observeForever { peers ->
        peers?.allPeers?.let {
          if(it.isNotEmpty()){
            view.connect(it[0].id)
          }
        }
    }
    return view

  }
}

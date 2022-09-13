package com.reactnativeawesomemodule

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import gcore.videocalls.meet.GCoreMeet
import gcore.videocalls.meet.logger.LLog
import gcore.videocalls.meet.ui.view.remoteuser.RemoteUserVideoView

class GCRemoteViewManager(var mCallerContext: ReactApplicationContext) :
  SimpleViewManager<RemoteUserVideoView>() {

  override fun getName(): String {
    return "GCRemoteView"
  }

  override fun onDropViewInstance(view: RemoteUserVideoView) {
    view.release()
    super.onDropViewInstance(view)
  }

  override fun createViewInstance(reactContext: ThemedReactContext): RemoteUserVideoView {
    val view = RemoteUserVideoView(reactContext.baseContext)

    GCoreMeet.instance.roomState.remoteUsers.observeForever { remoteUsers ->
      remoteUsers?.list?.let { users ->
        if (users.isNotEmpty()) {
          LLog.d("ReactRemoteViewManager", "connect remote user: ${users[0].id}")
          view.connect(users[0].id)
        }
      }
    }
    return view
  }
}

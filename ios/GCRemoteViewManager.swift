import Foundation

@objc(GCRemoteViewManager)
class GCRemoteViewManager: RCTViewManager {

  override func view() -> UIView! {
      GCViewsEnum.remote.contentMode = .scaleAspectFit
      return GCViewsEnum.remote
  }

  @objc override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}

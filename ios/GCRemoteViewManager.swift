import Foundation

@objc(GCRemoteViewManager)
class GCRemoteViewManager: RCTViewManager {

  override func view() -> UIView! {
    return GCViewsEnum.remote
  }

  @objc override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}

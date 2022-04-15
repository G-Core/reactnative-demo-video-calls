import Foundation

@objc(GCLocalViewManager)
class GCLocalViewManager: RCTViewManager {

  override func view() -> UIView! {
    return ViewsEnum.local
  }

  @objc override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
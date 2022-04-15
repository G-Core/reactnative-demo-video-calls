import Foundation

@objc(GCMeetPermissions)
class GCMeetPermissions: NSObject {
    @objc
    func authorizeForVideo(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DeviceManager.authorizeForVideo { isGranted in
            resolve(isGranted)
        }
    }
    
    @objc
    func authorizeForAudio(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DeviceManager.authorizeForAudio { isGranted in
            resolve(isGranted)
        }
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    func constantsToExport() -> [AnyHashable : Any]! {
        return [
            "isGrantedForAudio": DeviceManager.isGrantedForAudio(),
            "isGrantedForVideo": DeviceManager.isGrantedForVideo(),
        ]
    }

}

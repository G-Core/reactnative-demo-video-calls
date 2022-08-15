import Foundation

@objc(GCMeetPermissions)
class GCMeetPermissions: NSObject {
    @objc
    func authorizeForVideo(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                resolve(granted)
            }
        case .restricted:
            resolve(false)
        case .denied:
            resolve(false)
        case .authorized:
            resolve(true)
        @unknown default:
            resolve(false)
        }        
    }
    
    @objc
    func authorizeForAudio(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        switch AVCaptureDevice.authorizationStatus(for: .audio) {
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .audio) { granted in
                resolve(granted)
            }
        case .restricted:
            resolve(false)
        case .denied:
            resolve(false)
        case .authorized:
            resolve(true)
        @unknown default:
            resolve(false)
        }        
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    func constantsToExport() -> [AnyHashable : Any]! {
        return [
            "isGrantedForAudio": AVCaptureDevice.authorizationStatus(for: .audio) == .authorized,
            "isGrantedForVideo": AVCaptureDevice.authorizationStatus(for: .video) == .authorized
        ]
    }

}


import Foundation
import GCoreVideoCallsSDK

class DeviceManager {
    static func authorizeForVideo(status: @escaping ((_ isGranted: Bool) -> Void)) {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                status(granted)
            }
        case .restricted:
            status(false)
        case .denied:
            status(false)
        case .authorized:
            status(true)
        @unknown default:
            status(false)
        }
    }
    
    static func isGrantedForVideo() -> Bool {
        AVCaptureDevice.authorizationStatus(for: .video) == .authorized
    }
    
    static func authorizeForAudio(status: @escaping ((_ isGranted: Bool) -> Void)) {
        switch AVCaptureDevice.authorizationStatus(for: .audio) {
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .audio) { granted in
                status(granted)
            }
        case .restricted:
            status(false)
        case .denied:
            status(false)
        case .authorized:
            status(true)
        @unknown default:
            status(false)
        }
    }
    
    static func isGrantedForAudio() -> Bool {
        AVCaptureDevice.authorizationStatus(for: .audio) == .authorized
    }
}

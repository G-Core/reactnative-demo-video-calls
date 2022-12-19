import Foundation
import GCoreVideoCallsSDK
import WebRTC
import React
import GcoreVideoBufferHandler

struct ConnectionOptions {
    var isVideoOn = false
    var isAudioOn = false
    var roomId = ""
    var displayName = ""
    var clientHostName = ""
    var blurSigma: Double = 10
}


@objc(GCMeetService)
class GCMeetService: RCTEventEmitter {

    private let bufferHandler = GcoreBufferHandler()
    private var client = GCoreMeet.shared
    private var joinOptions: ConnectionOptions!

    override func supportedEvents() -> [String]! {
        return ["onConnectionChanged"]
    }

    @objc
    func openConnection(_ options: NSDictionary) {
        GCoreRoomLogger.activateLogger()

        client.cameraParams = GCoreCameraParams(cameraPosition: .front)

        var userRole: GCoreUserRole
        if let role = options["role"] {
            switch role as! String {
            case "common": userRole = .common
            case "moderator": userRole = .moderator
            default: userRole = .unknown
          }
        } else {
            userRole = .unknown
        }

        let localUserParams = GCoreLocalUserParams(
            name: options["displayName"] as! String,
            role: userRole)

        let roomParams = GCoreRoomParams(
            id: options["roomId"] as! String)
           // host: options["clientHostName"] as? String)

        client.connectionParams = (localUserParams, roomParams)

        joinOptions = ConnectionOptions(
            isVideoOn: options["isVideoOn"] as! Bool,
            isAudioOn: options["isAudioOn"] as! Bool,
            blurSigma: options["blurSigma"] as! Double
        )

        try? client.startConnection()
        client.audioSessionActivate()
        client.roomListener = self

        bufferHandler.setBlurRadius(joinOptions.blurSigma)
        bufferHandler.mode = .detectFaceAndBlur
        client.webrtcBufferDelegate = self
    }

//     @objc
//     func enableBlur() {
//         client.webrtcBufferDelegate = self
//         print("blur on")
//     }
//
//     @objc
//     func disableBlur() {
//         client.webrtcBufferDelegate = nil
//         print("blur off")
//     }

    @objc
    func closeConnection() {
        client.close()
    }

    @objc
    func enableVideo() {
        toggleVideo(true)
    }

    @objc
    func disableVideo() {
        toggleVideo(false)
    }

    @objc
    func toggleVideo(_ isOn: Bool) {
        client.localUser?.toggleCam(isOn: isOn)
        print("toggleVideo: ", isOn)
    }

    @objc
    func enableAudio() {
        toggleAudio(true)
    }

    @objc
    func disableAudio() {
        toggleAudio(false)
    }

    @objc
    func toggleAudio(_ isOn: Bool) {
        client.localUser?.toggleMic(isOn: isOn)
        print("toggleAudio: ", isOn)
    }

    @objc
    func flipCamera() {
        client.localUser?.flipCam(completion: { error in
            if let error = error {
                debugPrint(error)
            }
        })
    }

    @objc
    override func constantsToExport() -> [AnyHashable : Any]! {
        return [:]
    }


    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}

extension GCMeetService: MediaCapturerBufferDelegate {
 func mediaCapturerDidBuffer(_ pixelBuffer: CVPixelBuffer) {
   bufferHandler.proccessBuffer(pixelBuffer)
 }
}


extension GCMeetService: GCoreRoomListener {
    func roomClient(_ client: GCoreRoomClient, waitingRoomIsActive: Bool) {

    }

    func roomClient(_ client: GCoreRoomClient, captureSession: AVCaptureSession, captureDevice: AVCaptureDevice) {
        guard let videoOutput = captureSession.outputs.first(where: { $0 is AVCaptureVideoDataOutput }) as? AVCaptureVideoDataOutput else {
          return
        }
        videoOutput.alwaysDiscardsLateVideoFrames = true
    }

    func roomClientHandle(error: GCoreRoomError) {
        if case .fatalError(let error) = error {
          switch error {
          case HTTPUpgradeError.notAnUpgrade(502):
            try? client.startConnection()
          default: break
          }
        }
      }

    func roomClientHandle(_ client: GCoreRoomClient, forAllRoles joinData: GCoreJoinData) {
        switch joinData {

        case .permissions(mediaStreams: let mediaStreams):
            print("permissions: ", mediaStreams)
        case .othersInRoom(remoteUsers: let remoteUsers):
            print("othersInRoom: ", remoteUsers)
        case .localUser(info: let info):
            print("localUser: ", info)
        default:
            print("default")
        }
    }

    func roomClientHandle(_ client: GCoreRoomClient, remoteUsersEvent: GCoreRemoteUsersEvent) {
        switch remoteUsersEvent {

        case .handleRemote(user: let user):
            print("handleRemote: ", user)
        case .closedRemote(userId: let userId):
            print("closedRemote: ", userId)
        case .activeSpeaker(remoteUserIds: let remoteUserIds):
            print("activeSpeaker: ", remoteUserIds)
        case .userSleep(id: let id, isSleeping: let isSleeping):
            print("userSleep: ", id, isSleeping)
        case .changeName(userId: let userId, new: let new, old: let old):
            print("changeName: ", userId, old, new)
        default:
            print("default")
        }
    }

    func roomClientHandle(_ client: GCoreRoomClient, mediaEvent: GCoreMediaEvent) {
        switch mediaEvent {

        case .produceLocalVideo(track: let track):
            print("RoomListener: produceLocalVideoTrack:", track)
            DispatchQueue.main.async {
                track.add(GCViewsEnum.local)
            }
        case .produceLocalAudio(track: let track):
            print("produceLocalAudio: ", track)
        case .didCloseLocalVideo(track: let track):
            print("didCloseLocalVideo: ", track ?? "nil")
            DispatchQueue.main.async {
                track?.remove(GCViewsEnum.local)
            }
        case .didCloseLocalAudio(track: let track):
            print("didCloseLocalAudio: ", track ?? "nil")
        case .handledRemoteVideo(videoObject: let videoObject):
            print("RoomListener: handledRemoteVideoTrack:", videoObject)
            DispatchQueue.main.async {
                videoObject.rtcVideoTrack.add(GCViewsEnum.remote)
            }
        case .produceRemoteAudio(audioObject: let audioObject):
            print("produceRemoteAudio: ", audioObject)
        case .didCloseRemoteVideo(byModerator: let byModerator, videoObject: let videoObject):
            print("didCloseRemoteVideo: ", byModerator, videoObject)
            DispatchQueue.main.async {
                videoObject.rtcVideoTrack.remove(GCViewsEnum.remote)
            }
        case .didCloseRemoteAudio(byModerator: let byModerator, audioObject: let audioObject):
            print("didCloseRemoteAudio: ", byModerator, audioObject)
        case .togglePermissionsByModerator(kind: let kind, status: let status):
            print("togglePermissionsByModerator: ", kind, status)
        case .acceptedPermission(kind: let kind):
            print("acceptedPermission: ", kind)
        case .disableProducerByModerator(media: let media):
            print("disableProducerByModerator: ", media)
        default:
            print("default")
        }
    }

    func roomClientHandle(_ client: GCoreRoomClient, connectionEvent: GCoreRoomConnectionEvent) {

        sendEvent(withName: "onConnectionChanged", body: ["connection": String(describing: connectionEvent)])
        switch connectionEvent {

        case .startToConnectWithServices:
            print("startToConnectWithServices")
        case .successfullyConnectWithServices:
            print("successfullyConnectWithServices")
        case .didConnected:
            print("RoomListener: roomClientDidConnected")

            DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                if self.joinOptions.isVideoOn {
                    self.toggleVideo(self.joinOptions.isVideoOn)
                    print("toggleVideo joined: ", self.joinOptions.isVideoOn)
                }

                if self.joinOptions.isAudioOn {
                    self.toggleAudio(self.joinOptions.isAudioOn)
                    print("toggleAudio joined: ", self.joinOptions.isAudioOn)
                }
            }
        case .reconnecting:
            print("reconnecting")
        case .reconnectingFailed:
            print("reconnectingFailed")
        case .socketDidDisconnected:
            print("socketDidDisconnected")
        case .waitingForModeratorJoinAccept:
            print("waitingForModeratorJoinAccept")
        case .moderatorRejectedLocalJoinRequest:
            print("moderatorRejectedLocalJoinRequest")
        case .removedByModerator:
            print("removedByModerator")
        default:
            print("default")
        }
    }
}

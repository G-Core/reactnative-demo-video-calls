import Foundation
import GCoreVideoCallsSDK
import WebRTC

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

    private var client: GCoreRoomClient?
    private var joinOptions: ConnectionOptions!
    
    private var isConnectedOppoennt = false

    @objc
    func openConnection(_ roomOptions: NSDictionary) {
        GCoreRoomLogger.activateLogger()
        
        GCoreRoomLogger.log = { message in
            print(message);
        }
        
        print(roomOptions);
        
        let options = RoomOptions(cameraPosition: .front)
        let parameters = MeetRoomParametrs(
            roomId: roomOptions["roomId"] as! String,
            displayName: roomOptions["displayName"] as! String,
            clientHostName: roomOptions["clientHostName"] as? String,
            isModerator: roomOptions["isModerator"] as! Bool
        )

        joinOptions = ConnectionOptions(
            isVideoOn: roomOptions["isVideoOn"] as! Bool,
            isAudioOn: roomOptions["isAudioOn"] as! Bool,
            roomId: roomOptions["roomId"] as! String,
            displayName: roomOptions["displayName"] as! String,
            clientHostName: roomOptions["clientHostName"] as! String,
            blurSigma: roomOptions["blurSigma"] as! Double
        )
        
        client = GCoreRoomClient(roomOptions: options, requestParameters: parameters, roomListener: self)
        client?.setBufferDelegate(self)
        try? client?.open()
        client?.audioSessionActivate()
    }

    @objc
    func closeConnection() {
        client?.close()
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
        client?.toggleVideo(isOn: isOn)
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
        client?.toggleAudio(isOn: isOn)
        print("toggleAudio: ", isOn)
    }

    @objc
    func toggleCamera() {
        client?.toggleCameraPosition(completion: { error in
            if let error = error {
                debugPrint(error)
            }
        })
    }

    override func supportedEvents() -> [String]! {
        return []
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
      let ciimage = CIImage(cvPixelBuffer: pixelBuffer).applyingGaussianBlur(sigma: self.joinOptions.blurSigma)
    CIContext().render(ciimage, to: pixelBuffer)
  }
}


extension GCMeetService: RoomListener {
    func roomClient(roomClient: GCoreRoomClient, joinPermissions: JoinPermissionsObject) {
        
    }
    
    func roomClient(roomClient: GCoreRoomClient, toggleByModerator kind: String, status: Bool) {
        
    }
    
    func roomClient(roomClient: GCoreRoomClient, acceptedPermissionFromModerator fromModerator: Bool, peer: PeerObject, requestType: String) {
        
    }
    
    func roomClientWaitingForModeratorJoinAccept() {
        
    }
    
    func roomClientModeratorRejectedJoinRequest() {
        
    }
    
    func roomClient(roomClient: GCoreRoomClient, moderatorIsAskedToJoin: ModeratorIsAskedToJoin) {
        
    }
    
    func roomClient(roomClient: GCoreRoomClient, updateMeInfo: UpdateMeInfoObject) {
        
    }
    
    func roomClient(roomClient: GCoreRoomClient, requestToModerator: RequestToModerator) {
        
    }
    
    func roomClientRemovedByModerator() {
        
    }
    
    func roomClient(roomClient: GCoreRoomClient, captureSession: AVCaptureSession, captureDevice: AVCaptureDevice) {
        
    }
    
    func roomClientStartToConnectWithServices() {
        //delegate?.startConnecting()
        print("roomClientStartToConnectWithServices")
    }
    
    func roomClientSuccessfullyConnectWithServices() {
        // delegate?.finishConnecting()
        print("roomClientSuccessfullyConnectWithServices:")
    }
    
    func roomClientHandle(error: RoomError) {
        print("RoomListener:", error.localizedDescription)
    }
    
    func roomClientDidConnected() {
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
    }
    
    func roomClientReconnecting() {
        print("RoomListener: roomClientReconnecting")
    }
    
    func roomClientReconnectingFailed() {
        print("RoomListener: roomClientReconnectingFailed")        
//        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
//            try? self.client?.open()
//        }
    }
    
    func roomClientSocketDidDisconnected(roomClient: GCoreRoomClient) {
        print("RoomListener: roomClientSocketDidDisconnected", roomClient)
    }
    
    func roomClient(roomClient: GCoreRoomClient, joinWithPeersInRoom peers: [PeerObject]) {
        print("RoomListener: joinWithPeersInRoom peers:", peers)
        // delegate?.joinWithPeersInRoom(peers)
    }
    
    func roomClient(roomClient: GCoreRoomClient, handlePeer: PeerObject) {
        // delegate?.handledPeer(handlePeer)
        print("RoomListener: handlePeer:", handlePeer.displayName ?? "name unknown")
    }
    
    func roomClient(roomClient: GCoreRoomClient, disableProducerByModerator kind: String) {
        // delegate?.peerClosed(peerClosed)
        print("RoomListener: peerClosed:", kind)
    }
    
    func roomClient(roomClient: GCoreRoomClient, peerClosed: String) {
        // delegate?.peerClosed(peerClosed)
        print("RoomListener: peerClosed:", peerClosed)
    }
    
    func roomClient(roomClient: GCoreRoomClient, produceLocalVideoTrack videoTrack: RTCVideoTrack) {
        print("RoomListener: produceLocalVideoTrack:", videoTrack)
        DispatchQueue.main.async {
            videoTrack.add(GCViewsEnum.local)
        }
    }
    
    func roomClient(roomClient: GCoreRoomClient, produceLocalAudioTrack audioTrack: RTCAudioTrack) {
        print("RoomListener: produceLocalAudioTrack:", audioTrack)
        // delegate?.produceLocalAudioTrack(audioTrack)
    }
    
    func roomClient(roomClient: GCoreRoomClient, didCloseLocalVideoTrack videoTrack: RTCVideoTrack?) {
        print("RoomListener: didCloseLocalVideoTrack:", videoTrack ?? "")
    }
    
    func roomClient(roomClient: GCoreRoomClient, didCloseLocalAudioTrack audioTrack: RTCAudioTrack?) {
        print("RoomListener: didCloseLocalAudioTrack:", audioTrack ?? "")
    }
    
    // MARK: - Remote
    
    // Video
    func roomClient(roomClient: GCoreRoomClient, handledRemoteVideo videoObject: VideoObject) {
//        if !isConnectedOppoennt {
            print("RoomListener: handledRemoteVideoTrack:", videoObject, roomClient)
            DispatchQueue.main.async {
                // self?.delegate?.handledRemoteVideo(videoObject)
                videoObject.rtcVideoTrack.remove(GCViewsEnum.remote)
                videoObject.rtcVideoTrack.add(GCViewsEnum.remote)
            }
            
            isConnectedOppoennt = true
//        }
        
    }
    
    func roomClient(roomClient: GCoreRoomClient, didCloseRemoteVideoByModerator byModerator: Bool, videoObject: VideoObject) {
        print("RoomListener: didCloseRemoteVideoByModerator:", videoObject)
        DispatchQueue.main.async {
            // self?.delegate?.willCloseRemoteVideo(videoObject)
        }
    }
    
    // Audio
    func roomClient(roomClient: GCoreRoomClient, produceRemoteAudio audioObject: AudioObject) {
        DispatchQueue.main.async {
            // self?.delegate?.audioDidChanged(audioObject)
        }
    }

    func roomClient(roomClient: GCoreRoomClient, didCloseRemoteAudioByModerator byModerator: Bool, audioObject: AudioObject) {
        DispatchQueue.main.async {
            // self?.delegate?.audioDidChanged(audioObject)
        }
    }
    
    func roomClient(roomClient: GCoreRoomClient, activeSpeakerPeers peers: [String]) {
        DispatchQueue.main.async {
            // self?.delegate?.activeSpeakerPeers(peers)
        }
    }
}

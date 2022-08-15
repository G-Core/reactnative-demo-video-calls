#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(GCMeetService, RCTEventEmitter)
    RCT_EXTERN_METHOD(openConnection: (NSDictionary*)roomOptions)
    RCT_EXTERN_METHOD(closeConnection)
    RCT_EXTERN_METHOD(toggleVideo: BOOL)
    RCT_EXTERN_METHOD(toggleAudio: BOOL)
    RCT_EXTERN_METHOD(enableAudio)
    RCT_EXTERN_METHOD(disableAudio)
    RCT_EXTERN_METHOD(enableVideo)
    RCT_EXTERN_METHOD(disableVideo)
    RCT_EXTERN_METHOD(flipCamera)
    RCT_EXTERN_METHOD(enableBlur)
    RCT_EXTERN_METHOD(disableBlur)

  // RCT_EXTERN_METHOD(getCount: (RCTResponseSenderBlock)callback)
  /**
  @objc
  func decrement(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) -> Void

  RCT_EXTERN_METHOD(
  decrement: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)
  **/
@end

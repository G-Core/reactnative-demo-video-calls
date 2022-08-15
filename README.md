## Getting Started
```sh
yarn install
```
​
## Running on iOS Device
* Open the project MyExample/ios/MyExample.xcworkspace in Xcode
* Ensure that in pod Pods/react_native_awesome_module ```Build Phases -> Link Binary With Library``` contains the GCoreVideoCallsSDK framework.
* Select your device in Xcode and press "Build and run"
  ​
## Running on Android Device
* Run Android emulator or connect Android device with Android Studio
* Open the project MyExample in terminal
* Run command ```react-native run-android```
  ​
  ​
## How to use SDK with react-native
### Android
#### Import SDK to Android project
Place SDK and mediasoup in your project.<br/>
Change settings.gradle file (located in android directory of your main project) with following code for include projects:
```gradle
include ':mediasoup-android-client'
project(':mediasoup-android-client').projectDir = new File(rootProject.projectDir, 'path/to/mediasoup/folder')
​
include ':GCoreVideoCallsSDK'
project(':GCoreVideoCallsSDK').projectDir = new File(rootProject.projectDir, '/path/to/SDK/folder')
```
Add dependency to your build.gradle (located in android directory located in root of your project)
```gradle
  implementation project(":mediasoup-android-client")
  implementation project(":GCoreVideoCallsSDK")
```
#### Implementation native module
Create native module by [official react-native docs](https://reactnative.dev/docs/native-modules-android) <br/>
In that module you have to implement functions that you want to use from SDK in your JS application
<br/>
First step to use SDK is `GCoreMeet.instance.init` function
<br/>
Init SDK function from our example application:
```kotlin
  init {
    runOnUiThread {
      GCoreMeet.instance.init(application, null, false)
    }
  }
```
How you can see you need to pass `application` as parameter to init SDK function, for do that you may pass `application` to your module from your package:
```kotlin
class MyAppPackage(private val application: Application) : ReactPackage {
    //...
  override fun createNativeModules(
    reactContext: ReactApplicationContext
  ): MutableList<NativeModule> = listOf(GCMeetService(reactContext, application)).toMutableList()
}
```
And pass `application` to your package from your `MainApplication` (located in android directory of your main project):
```java
public class MainApplication extends Application implements ReactApplication {
    private final ReactNativeHost mReactNativeHost =
            new ReactNativeHost(this) {
                //...
                @Override
                protected List<ReactPackage> getPackages() {
                    List<ReactPackage> packages = new PackageList(this).getPackages();
                    packages.add(new MyAppPackage(getApplication()));
                    return packages;
                }
                //...
            };
    //...
}
```

For join to a room you have to set some required parameters to `GCoreMeet.instance.setConnectionParams` and then call `GCoreMeet.instance.connect(reactContext)`
<br/>
Join user to room function from our example application:

```kotlin
  @ReactMethod
  fun openConnection(options: ReadableMap) {
    runOnUiThread {

      val userRole = when (options.getString("role") ?: "") {
        "common" -> UserRole.COMMON
        "moderator" -> UserRole.MODERATOR
        else -> UserRole.UNKNOWN
      }
      val userInfo = LocalUserInfo(
        displayName = options.getString("displayName") ?: "",
        role = userRole
      )

      val roomParams = RoomParams(
        roomId = options.getString("roomId") ?: "",
        hostName = options.getString("clientHostName") ?: "",
      ).apply {
        startWithCam = options.getBoolean("isVideoOn")
        startWithMic = options.getBoolean("isAudioOn")
      }

      GCoreMeet.instance.setConnectionParams(userInfo, roomParams)
      GCoreMeet.instance.connect(reactContext)

      GCoreMeet.instance.room.provider.roomInfo.observeForever { roomInfo ->
        if (roomInfo.connectionState == ConnectionState.CONNECTED) {
          if (roomParams.startWithCam)
            this.enableVideo()
        }
      }


      val audioManager: AudioManager =
        reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      audioManager.isSpeakerphoneOn = true
      audioManager.mode = AudioManager.MODE_IN_CALL
    }
  }
```
Make sure that SDK functions `GCoreMeet.instance.init` and `GCoreMeet.instance.roomManager.join` running in UI Thread
<br/>

You have to use view components from SDK in your react-native application
`LocalVideoTextureView` - to show local video stream
`RemoteUserVideoView` - to show remote video stream
<br/>

Create view manager for `LocalVideoTextureView` by example:
```kotlin
class GCLocalViewManager(var mCallerContext: ReactApplicationContext) :
  SimpleViewManager<LocalVideoTextureView>() {

  override fun getName(): String {
    return "GCLocalView"
  }

  override fun createViewInstance(reactContext: ThemedReactContext): LocalVideoTextureView {
    val view = LocalVideoTextureView(reactContext.baseContext)
    view.connect()
    return view
  }
}
```
And create `RemoteUserVideoView` by example:
```kotlin
class GCRemoteViewManager(var mCallerContext: ReactApplicationContext) :
  SimpleViewManager<RemoteUserVideoView>() {

  override fun getName(): String {
    return "GCRemoteView"
  }

  override fun createViewInstance(reactContext: ThemedReactContext): RemoteUserVideoView {
    val view = RemoteUserVideoView(reactContext.baseContext)

    GCoreMeet.instance.room.provider.remoteUsers.observeForever { remoteUsers ->
      remoteUsers?.allRemoteUsers?.let { users ->
        if (users.isNotEmpty()) {
          view.connect(users[0].id)
        }
        else {
          view.release()
        }
      }
    }
    return view
  }
}
```
You have to call function `connect` for `RemoteUserVideoView` and pass `userId` into
You can get `userId` from `GCoreMeet.instance.room.provider.remoteUsers` by example above



### IOS

#### Implementation native module
Create native module by [official react-native docs](https://reactnative.dev/docs/native-modules-ios) <br/>
In that module you have to implement functions that you want to use from SDK in your JS application
<br/>
For join to a room you have to set some required parameters to `GCoreMeet.shared.connectionParams` and then call `GCoreMeet.shared.startConnection()`
<br/>
Join user to room function from our example application:

```swift
    private var client = GCoreMeet.shared
    private var joinOptions: ConnectionOptions!

    private var isConnectedOpponent = false

    @objc
    func openConnection(_ options: NSDictionary) {
        GCoreRoomLogger.activateLogger()

        client.cameraParams = GCoreCameraParams(cameraPosition: .front)

        var userRole: GCoreUserRole
        if let role = options["role"]  {
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
            id: options["roomId"] as! String,
            host: options["clientHostName"] as? String)

        client.connectionParams = (localUserParams, roomParams)

        joinOptions = ConnectionOptions(
            isVideoOn: options["isVideoOn"] as! Bool,
            isAudioOn: options["isAudioOn"] as! Bool,
            blurSigma: options["blurSigma"] as! Double
        )

        try? client.startConnection()
        client.audioSessionActivate()
        client.roomListener = self
    }
```

Implement roomListener if you want to have some callbacks:
```swift
extension GCMeetService: GCoreRoomListener {
    //...
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
    //...
```

You can use view components `RTCEAGLVideoView` from WebRTC in your react-native application
<br/>

Create views enum by example:
```swift
import WebRTC

enum GCViewsEnum {
     public static let local: RTCEAGLVideoView = RTCEAGLVideoView()
     public static let remote: RTCEAGLVideoView = RTCEAGLVideoView()
}
```
And then create local view component `GCLocalViewManager` by example:
```swift
import Foundation

@objc(GCLocalViewManager)
class GCLocalViewManager: RCTViewManager {

  override func view() -> UIView! {
    return GCViewsEnum.local
  }

  @objc override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
```
And remote view component:
```swift
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
```

### Using native module functions in your js

Example usage openConnection function from native module to join to room:
```ts
    import { NativeModules } from 'react-native';
    // ...
    NativeModules.GCMeetService.openConnection({
            roomId: 'serv1234',
            displayName: 'Client from react native',
            isAudioOn: true,
            isVideoOn: true,
            isModerator: false,
          });
```

Create two components for views:
<br/>
Local view component example:
```ts
interface ViewProps extends PropsWithChildren<any> {
  style: StyleProp<ViewStyle>;
}
const GCLocalView = requireNativeComponent<ViewProps>('GCLocalView');
export default GCLocalView;
```
​
Remote view component example:
```ts
interface ViewProps extends PropsWithChildren<any> {
  style: StyleProp<ViewStyle>;
}
const GCRemoteView = requireNativeComponent<ViewProps>('GCRemoteView');
export default GCRemoteView;
```
​
Now you can use them in your call screen:
```js
 return (
    <View style={styles.root}>
      <View style={styles.container}>
        <View>
          {videoOn && (
            <View>
              <GCLocalView style={[styles.mirror, styles.preview]} />
            </View>
          )}
        //...
        </View>
      </View>
      <GCRemoteView style={[styles.remote, getTransform()]} />
    </View>
  );
```

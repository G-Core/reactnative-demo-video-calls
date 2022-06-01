import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState, useEffect, PropsWithChildren} from 'react';

import {
  requireNativeComponent,
  StyleSheet,
  View,
  ViewStyle,
  NativeModules,
  Pressable,
  Dimensions,
  StyleProp,
} from 'react-native';

import {withAnchorPoint} from 'react-native-anchor-point';

import {CameraIcon, MicrophoneIcon, DropIcon, SwitchCameraIcon} from './Icons';
import type {RootStackParamList} from './types';

const screen = Dimensions.get('screen');
const aspectRatio = 4 / 3;
const height = screen.height - 80;
const width = height * aspectRatio; // * screen.scale;

const getTransform = () => {
  let transform = {
    transform: [{translateX: (screen.width - width) / 2}, {translateY: 0}],
  };
  return withAnchorPoint(transform, {x: 0, y: 0}, {width, height});
};

interface ViewProps extends PropsWithChildren<any> {
  style: StyleProp<ViewStyle>;
}

export const GCRemoteView = requireNativeComponent<ViewProps>('GCRemoteView');
export const GCLocalView = requireNativeComponent<ViewProps>('GCLocalView');

export const RoomScreen = ({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Room'>) => {
  const [videoOn, onChangeVideo] = useState(route.params.isVideoOn);
  const [audioOn, onChangeAudio] = useState(route.params.isAudioOn);

  useEffect(
    () =>
      navigation.addListener('focus', () => {
        NativeModules.GCMeetService.openConnection(route.params);
      }),
    [navigation, route.params],
  );

  const disconnect = () => {
    navigation.goBack();
  };

  const toggleVideo = async () => {
    const result = await NativeModules.GCMeetPermissions.authorizeForVideo();
    if (result) {
      const newValue = !videoOn;
      if (newValue) {
        NativeModules.GCMeetService.enableVideo();
      } else {
        NativeModules.GCMeetService.disableVideo();
      }
      onChangeVideo(newValue);
    }
  };

  const toggleAudio = async () => {
    const result = await NativeModules.GCMeetPermissions.authorizeForAudio();
    if (result) {
      const newValue = !audioOn;
      if (newValue) {
        NativeModules.GCMeetService.enableAudio();
      } else {
        NativeModules.GCMeetService.disableAudio();
      }
      onChangeAudio(newValue);
    }
  };

  const switchCamera = () => {
    NativeModules.GCMeetService.toggleCamera();
  };

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <View>
          {videoOn && (
            <View>
              <GCLocalView style={[styles.mirror, styles.preview]} />
            </View>
          )}

          <View style={styles.toolbar}>
            <Pressable style={[styles.btn]} onPress={switchCamera}>
              <SwitchCameraIcon />
            </Pressable>
            <Pressable
              style={[styles.btn, videoOn ? styles.on : styles.off]}
              onPress={toggleVideo}>
              <CameraIcon />
            </Pressable>
            <Pressable
              style={[styles.btn, audioOn ? styles.on : styles.off]}
              onPress={toggleAudio}>
              <MicrophoneIcon />
            </Pressable>
            <Pressable style={[styles.btn, styles.drop]} onPress={disconnect}>
              <DropIcon />
            </Pressable>
          </View>
        </View>
      </View>
      <GCRemoteView style={[styles.remote, getTransform()]} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  container: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    zIndex: 1,
    elevation: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    position: 'absolute',
    padding: 20,
  },
  remote: {
    width,
    height,
    zIndex: 0,
    elevation: 0,
    borderRadius: 0,
    position: 'absolute',
  },
  mirror: {
    transform: [{scaleX: -1}],
  },
  preview: {
    height: 160,
    borderRadius: 8,
    marginVertical: 20,
    overflow: 'hidden',
    aspectRatio: 3 / 4,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#2e264a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drop: {
    backgroundColor: '#e74c3c',
  },
  on: {
    backgroundColor: '#69ba3c',
  },
  off: {
    backgroundColor: '#2e264a',
  },
  text: {
    color: 'white',
    fontSize: 12,
  },
});

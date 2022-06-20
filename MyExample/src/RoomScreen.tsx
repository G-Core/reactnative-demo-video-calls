import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';

import {
  Dimensions,
  NativeModules,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { withAnchorPoint } from 'react-native-anchor-point';
import GCLocalView from './GCLocalView';
import GCRemoteView from './GCRemoteView';

import {
  CameraIcon,
  DropIcon,
  MicrophoneIcon,
  SwitchCameraIcon,
} from './Icons';
import type { RootStackParamList } from './types';

const screen = Dimensions.get('screen');
const aspectRatio = 4 / 3;
const height = screen.height - 80;
const width = height * aspectRatio; // * screen.scale;

const getTransform = () => {
  let transform = {
    transform: [{ translateX: (screen.width - width) / 2 }, { translateY: 0 }],
  };
  return withAnchorPoint(transform, { x: 0, y: 0 }, { width, height });
};

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

  const getCameraPermission = async () => {
    if (Platform.OS === 'ios') {
      return await NativeModules.GCMeetPermissions.authorizeForVideo();
    } else {
      return (
        (await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        )) === PermissionsAndroid.RESULTS.GRANTED
      );
    }
  };

  const toggleVideo = async () => {
    const result = await getCameraPermission();
    console.log(`video: ${result}`);
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

  const getMicPermission = async () => {
    if (Platform.OS === 'ios') {
      return await NativeModules.GCMeetPermissions.authorizeForAudio();
    } else {
      return (
        (await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        )) === PermissionsAndroid.RESULTS.GRANTED
      );
    }
  };

  const toggleAudio = async () => {
    const result = await getMicPermission();
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
    transform: [{ scaleX: -1 }],
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

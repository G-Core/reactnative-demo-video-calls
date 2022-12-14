import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';

import {Dimensions, NativeModules, Platform, Pressable, StyleSheet, View} from 'react-native';

import {withAnchorPoint} from 'react-native-anchor-point';
import GCRemoteView from './GCRemoteView';
import GCLocalView from './GCLocalView';

import {BlurIcon, CameraIcon, DropIcon, MicrophoneIcon, SwitchCameraIcon} from './Icons';
import type {RootStackParamList} from './types';
import {getCameraPermission, getMicPermission} from './helpers';

const screen = Dimensions.get('screen');
const aspectRatio = 4 / 3;
// const height = screen.height > screen.width ? screen.height - 80 : screen.width - 80;
const height = screen.height - 80;
const width = height * aspectRatio; // * screen.scale;

const getTransform = () => {
  let transform = {
    transform: [{translateX: (screen.width - width) / 2}, {translateY: 0}],
  };
  return withAnchorPoint(transform, {x: 0, y: 0}, {width, height});
};

export const RoomScreen = ({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Room'>) => {
  const [isVideoOn, onChangeVideo] = useState(route.params.isVideoOn);
  const [isAudioOn, onChangeAudio] = useState(route.params.isAudioOn);
  const [isBlurOn, onChangeBlur] = useState(false);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const disconnect = () => {
    NativeModules.GCMeetService.closeConnection();
    navigation.navigate('Home');
  };

  const toggleBlur = () => {
    if (Platform.OS === 'ios') {
      const newValue = !isBlurOn;
      if (newValue) {
        NativeModules.GCMeetService.enableBlur();
      } else {
        NativeModules.GCMeetService.disableBlur();
      }
      onChangeBlur(newValue);
    }
  };

  const toggleVideo = async () => {
    const result = await getCameraPermission();
    if (result) {
      const newValue = !isVideoOn;
      if (newValue) {
        NativeModules.GCMeetService.enableVideo();
      } else {
        NativeModules.GCMeetService.disableVideo();
      }
      onChangeVideo(newValue);
    }
  };

  const toggleAudio = async () => {
    const result = await getMicPermission();
    if (result) {
      const newValue = !isAudioOn;
      if (newValue) {
        NativeModules.GCMeetService.enableAudio();
      } else {
        NativeModules.GCMeetService.disableAudio();
      }
      onChangeAudio(newValue);
    }
  };

  const switchCamera = () => {
    NativeModules.GCMeetService.flipCamera();
  };

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <View>
          <View style={[styles.previewWrapper]}>
            <GCLocalView style={[styles.mirror, styles.preview]}/>
          </View>

          <View style={styles.toolbar}>
            <Pressable style={[styles.btn]} onPress={switchCamera}>
              <SwitchCameraIcon/>
            </Pressable>
            {Platform.OS === 'ios' && (
              <Pressable
                style={[styles.btn, isBlurOn ? styles.on : styles.off]}
                onPress={toggleBlur}>
                <BlurIcon/>
              </Pressable>
            )}
            <Pressable
              style={[styles.btn, isVideoOn ? styles.on : styles.off]}
              onPress={toggleVideo}>
              <CameraIcon/>
            </Pressable>
            <Pressable
              style={[styles.btn, isAudioOn ? styles.on : styles.off]}
              onPress={toggleAudio}>
              <MicrophoneIcon/>
            </Pressable>
            <Pressable style={[styles.btn, styles.drop]} onPress={disconnect}>
              <DropIcon/>
            </Pressable>
          </View>
        </View>
      </View>
      <GCRemoteView style={[styles.remote, getTransform()]}/>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'gray',
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
    backgroundColor: 'silver',
  },
  mirror: {
    transform: [{scaleX: -1}],
  },
  previewWrapper: {
    borderRadius: 8,
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

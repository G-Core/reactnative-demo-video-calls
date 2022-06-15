import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  NativeModules,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LogoIcon } from './Icons';
import type { RootStackParamList } from './types';

export const HomeScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Home'>) => {
  const [clientHostName, onChangeClientHostName] = useState(
    'https://meet.gcorelabs.com',
  );
  const [roomId, onChangeText] = useState('serv1');
  const [displayName, onChangeDisplayName] = useState('From React Native');
  const [isAudioOn, onChangeAudio] = useState(false);
  const [isVideoOn, onChangeVideo] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const { isGrantedForAudio, isGrantedForVideo } =
        NativeModules.GCMeetPermissions.getConstants();

      onChangeAudio(isGrantedForAudio);
      onChangeVideo(isGrantedForVideo);
    } else {
      initAudioVideoAndroidState();
    }
  }, []);

  const initAudioVideoAndroidState = async () => {
    const isGrantedForAudio = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    const isGrantedForVideo = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );

    onChangeAudio(isGrantedForAudio);
    onChangeVideo(isGrantedForVideo);
  };

  const toggleVideo = async (isOn: boolean) => {
    let isGrantedForVideo = false;

    if (Platform.OS === 'ios') {
      isGrantedForVideo =
        NativeModules.GCMeetPermissions.getConstants().isGrantedForVideo;
    } else {
      isGrantedForVideo = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
    }

    if (isOn && !isGrantedForVideo) {
      const result = await getCameraPermission();
      if (!result) {
        return;
      }
    }

    onChangeVideo(isOn);
  };

  const toggleAudio = async (isOn: boolean) => {
    let isGrantedForAudio = false;

    if (Platform.OS === 'ios') {
      isGrantedForAudio =
        NativeModules.GCMeetPermissions.getConstants().isGrantedForAudio;
    } else {
      isGrantedForAudio = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
    }

    if (isOn && !isGrantedForAudio) {
      const result = await getMicPermission();
      if (!result) {
        return;
      }
    }

    onChangeAudio(isOn);
  };

  const getCameraPermission = async () => {
    if (Platform.OS === 'ios') {
      return await NativeModules.GCMeetPermissions.authorizeForVideo();
    } else {
      return (
        (await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        )) === 'granted'
      );
    }
  };

  const getMicPermission = async () => {
    if (Platform.OS === 'ios') {
      return await NativeModules.GCMeetPermissions.authorizeForAudio();
    } else {
      return (
        (await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        )) === 'granted'
      );
    }
  };

  useEffect(
    () =>
      navigation.addListener('focus', () => {
        NativeModules.GCMeetService.closeConnection();
      }),
    [navigation],
  );

  return (
    <View style={styles.container}>
      <LogoIcon style={styles.logo} />

      <View style={styles.formgroup}>
        <Text style={[styles.label, styles.labelText, styles.labelPostion]}>
          Hostname
        </Text>
        <TextInput
          accessibilityLabel="HostName"
          placeholder="Hostname"
          style={styles.input}
          onChangeText={onChangeClientHostName}
          value={clientHostName}
        />
      </View>

      <View style={styles.formgroup}>
        <Text style={[styles.label, styles.labelText, styles.labelPostion]}>
          Room
        </Text>
        <TextInput
          accessibilityLabel="Room"
          placeholder="Room"
          style={styles.input}
          onChangeText={onChangeText}
          value={roomId}
        />
      </View>

      <View style={styles.formgroup}>
        <Text style={[styles.label, styles.labelText, styles.labelPostion]}>
          Display name
        </Text>
        <TextInput
          accessibilityLabel="Display name"
          placeholder="Display name"
          style={styles.input}
          onChangeText={onChangeDisplayName}
          value={displayName}
        />
      </View>

      <View style={styles.formrow}>
        <View style={styles.formgroup}>
          <Text style={[styles.labelText, styles.labelPostion]}>Audio</Text>
          <Switch
            style={styles.switch}
            trackColor={{ false: '#767577', true: '#724df3' }}
            thumbColor={'#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleAudio}
            value={isAudioOn}
          />
        </View>

        <View style={styles.formgroup}>
          <Text style={[styles.labelText, styles.labelPostion]}>Video</Text>
          <Switch
            style={styles.switch}
            trackColor={{ false: '#767577', true: '#724df3' }}
            thumbColor={'#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleVideo}
            value={isVideoOn}
          />
        </View>
      </View>

      <Pressable
        style={styles.join}
        onPress={() =>
          navigation.navigate('Room', {
            roomId,
            displayName,
            isAudioOn,
            isVideoOn,
            clientHostName,
            isModerator: true,
            blurSigma: 15,
          })
        }>
        <Text style={styles.joinText}>Присоединиться</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#131121',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: 60,
  },
  logo: {
    marginVertical: 20,
    alignSelf: 'center',
  },
  switch: {},
  formrow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: 220,
    height: 40,
    borderWidth: 0,
    padding: 10,
    color: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1a1530',
  },
  formgroup: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
  },
  join: {
    alignSelf: 'center',
    backgroundColor: '#724df3',
    color: '#fff',
    borderRadius: 10,
    margin: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  joinText: {
    fontSize: 20,
    color: '#fff',
  },
  label: {
    width: 100,
  },
  labelPostion: {
    marginRight: 15,
  },
  labelText: {
    color: '#fff',
    textAlign: 'right',
  },
});

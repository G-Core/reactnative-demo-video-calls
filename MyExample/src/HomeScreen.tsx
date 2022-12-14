import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  NativeModules, Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LogoIcon } from './Icons';
import type { ConnectOptions, RootStackParamList } from './types';
import {
  getAndroidBluetoothConnectPermission,
  getCameraPermission,
  getMicPermission,
  isGrantedForAudio,
  isGrantedForVideo,
  prepareClientHostName,
} from './helpers';

export const HomeScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Home'>) => {
  const [clientHostName, onChangeClientHostName] =
    useState('vconf.edgecenter.ru');
  const [roomId, onChangeText] = useState('serv0ReactNativeDemoAppTesting');
  const [displayName, onChangeDisplayName] = useState('From React Native');
  const [isAudioOn, onChangeAudio] = useState(false);
  const [isVideoOn, onChangeVideo] = useState(false);

  useEffect(() => {
    initAudioVideoState();

    if (Platform.OS === 'android' && Platform.Version >= 31) {
      getAndroidBluetoothConnectPermission()
    }
  }, []);

  const initAudioVideoState = async () => {
    const isAudioGranted = await isGrantedForAudio();
    const isVideoGranted = await isGrantedForVideo();

    onChangeAudio(isAudioGranted);
    onChangeVideo(isVideoGranted);
  };

  const toggleVideo = async (isOn: boolean) => {
    let isGranted = await isGrantedForVideo();

    if (isOn && !isGranted) {
      const result = await getCameraPermission();
      if (!result) {
        return;
      }
    }

    onChangeVideo(isOn);
  };

  const toggleAudio = async (isOn: boolean) => {
    let isAudioGranted = await isGrantedForAudio();

    if (isOn && !isAudioGranted) {
      const result = await getMicPermission();
      if (!result) {
        return;
      }
    }

    onChangeAudio(isOn);
  };

  const connect = () => {
    const options: ConnectOptions = {
      roomId,
      displayName,
      isAudioOn,
      isVideoOn,
      clientHostName,
      role: 'common',
      blurSigma: 35,
    };

    NativeModules.GCMeetService.openConnection({
      ...options,
      clientHostName: prepareClientHostName(options.clientHostName),
    });

    navigation.navigate('Room', options);
  };
  return (
    <View style={styles.container}>
      <LogoIcon style={styles.logo} />

      <View style={styles.formgroup}>
        <Text style={[styles.label, styles.labelText, styles.labelPosition]}>
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
        <Text style={[styles.label, styles.labelText, styles.labelPosition]}>
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
        <Text style={[styles.label, styles.labelText, styles.labelPosition]}>
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
          <Text style={[styles.labelText, styles.labelPosition]}>Audio</Text>
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
          <Text style={[styles.labelText, styles.labelPosition]}>Video</Text>
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

      <Pressable style={styles.join} onPress={() => connect()}>
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
  labelPosition: {
    marginRight: 15,
  },
  labelText: {
    color: '#fff',
    textAlign: 'right',
  },
});

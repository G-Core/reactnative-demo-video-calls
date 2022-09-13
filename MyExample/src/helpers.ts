import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

export const getAndroidBluetoothConnectPermission = async () => {
    return (
      (await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      )) === PermissionsAndroid.RESULTS.GRANTED
    );
};

export const getCameraPermission = async () => {
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

export const getMicPermission = async () => {
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

export const isGrantedForVideo = async () => {
  if (Platform.OS === 'ios') {
    return NativeModules.GCMeetPermissions.getConstants()
      .isGrantedForVideo as boolean;
  } else {
    return (await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    )) as boolean;
  }
};

export const isGrantedForAudio = async () => {
  if (Platform.OS === 'ios') {
    return NativeModules.GCMeetPermissions.getConstants()
      .isGrantedForAudio as boolean;
  } else {
    return (await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    )) as boolean;
  }
};

export const prepareClientHostName = (clientHostName: string) => {
  if (clientHostName.startsWith('https://')) {
    if (Platform.OS !== 'ios') {
      return clientHostName.replace('https://', '');
    }
  } else {
    if (Platform.OS === 'ios') {
      return 'https://' + clientHostName;
    }
  }
  return clientHostName;
};

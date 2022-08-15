export type ConnectOptions = {
  roomId: string;
  displayName: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
  role: string;
  clientHostName: string;
  blurSigma: number;
  peerId?: string;
};

export type RootStackParamList = {
  Home: undefined;
  Room: ConnectOptions;
};

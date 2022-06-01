export type RootStackParamList = {
  Home: undefined;
  Room: {
    roomId: string;
    displayName: string;
    isAudioOn: boolean;
    isVideoOn: boolean;
    isModerator: boolean;
    clientHostName: string;
    blurSigma: number;
  };
};

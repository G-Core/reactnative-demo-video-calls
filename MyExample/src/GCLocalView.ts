import { requireNativeComponent, StyleProp, ViewStyle } from 'react-native';
import type { PropsWithChildren } from 'react';

interface ViewProps extends PropsWithChildren<any> {
  style: StyleProp<ViewStyle>;
}
const GCLocalView = requireNativeComponent<ViewProps>('GCLocalView');
export default GCLocalView;

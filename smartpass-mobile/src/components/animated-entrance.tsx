import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const entrance = FadeInDown.duration(380).withInitialValues({ opacity: 0, translateY: 10 });

export function AnimatedEntrance({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <Animated.View entering={entrance} style={style}>
      {children}
    </Animated.View>
  );
}

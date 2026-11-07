import { useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

type PressableScaleProps = PropsWithChildren<
  Omit<PressableProps, 'children' | 'style'> & {
    style?: StyleProp<ViewStyle>;
  }
>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  children,
  onPressIn,
  onPressOut,
  style,
  ...props
}: PressableScaleProps) {
  const [pressed, setPressed] = useState(false);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(pressed ? 0.985 : 1, {
          damping: pressed ? 18 : 16,
          stiffness: pressed ? 280 : 260,
        }),
      },
    ],
  }), [pressed]);

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}

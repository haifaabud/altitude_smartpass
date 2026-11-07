import { useEffect } from 'react';
import type { ColorValue, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type AnimatedProgressBarProps = {
  progress: number;
  color: ColorValue;
  trackColor: ColorValue;
  height?: number;
  style?: ViewStyle;
  label?: string;
};

export function AnimatedProgressBar({
  progress,
  color,
  trackColor,
  height = 6,
  style,
  label,
}: AnimatedProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(progress, 100));
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(clampedProgress, {
      duration: 620,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedProgress, clampedProgress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  return (
    <Animated.View
      accessibilityLabel={label}
      accessibilityRole={label ? 'progressbar' : undefined}
      accessibilityValue={label ? { min: 0, max: 100, now: Math.round(clampedProgress) } : undefined}
      style={[{ height, overflow: 'hidden', borderRadius: height, backgroundColor: trackColor }, style]}>
      <Animated.View
        style={[
          {
            height: '100%',
            borderRadius: height,
            backgroundColor: color,
          },
          fillStyle,
        ]}
      />
    </Animated.View>
  );
}

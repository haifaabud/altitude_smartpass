/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';
import { cafeConfig } from '@/constants/cafe-config';

export const Colors = {
  light: {
    text: cafeConfig.theme.text,
    background: cafeConfig.theme.cream,
    backgroundElement: cafeConfig.theme.surface,
    backgroundSelected: cafeConfig.theme.tint,
    textSecondary: cafeConfig.theme.textSecondary,
    primary: cafeConfig.theme.primary,
    brandNavy: cafeConfig.theme.logoNavy,
    accent: cafeConfig.theme.accent,
    border: cafeConfig.theme.border,
  },
  dark: {
    text: '#F6EFE7',
    background: '#1E1813',
    backgroundElement: '#2B221B',
    backgroundSelected: '#423226',
    textSecondary: '#C6B8AA',
    primary: '#D5B18C',
    brandNavy: cafeConfig.theme.logoNavy,
    accent: '#D5B18C',
    border: '#4B3A2D',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 8,
  medium: 14,
  large: 20,
  hero: 26,
  pill: 999,
} as const;

export const TypeScale = {
  display: 34,
  headline: 28,
  title: 18,
  body: 14,
  detail: 12,
  caption: 10,
  micro: 8,
} as const;

export const IconSize = {
  small: 16,
  medium: 20,
  large: 24,
  feature: 32,
} as const;

export const Elevation = {
  card: {
    shadowColor: '#281A12',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  hero: {
    shadowColor: '#1C1713',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
} as const;

export const ButtonTokens = {
  minHeight: 48,
  horizontalPadding: Spacing.three,
  borderRadius: Radius.small,
} as const;

export const CardTokens = {
  padding: Spacing.three,
  borderRadius: Radius.medium,
  borderWidth: 1,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

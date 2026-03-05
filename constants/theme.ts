/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const brandColor = '#5d69b9';

export const Colors = {
  primary: brandColor,
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1E293B',
  secondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  light: {
    text: '#1E293B',
    background: '#F8FAFC',
    tint: brandColor,
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: brandColor,
    primary: brandColor,
    secondary: '#64748B',
    card: '#FFFFFF',
    border: '#E2E8F0',
  },
  dark: {
    text: '#E8EDF5',
    background: '#101828',
    tint: brandColor,
    icon: '#8899BB',
    tabIconDefault: '#5a6b8a',
    tabIconSelected: brandColor,
    primary: brandColor,
    secondary: '#8899BB',
    card: '#1a2640',
    border: '#2d3f5c',
  },
};

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
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

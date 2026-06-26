// src/ui/theme/typography.ts
import { Platform } from 'react-native';

// Sistema de tipografía — jerarquía clara y consistente
export const fontFamily = {
  regular: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  medium:  Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif-medium',
  bold:    Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif-condensed',
  mono:    Platform.OS === 'ios' ? 'SF Mono' : 'monospace',
};

export const fontSize = {
  xs:    11,
  sm:    13,
  base:  15,
  md:    17,
  lg:    20,
  xl:    24,
  '2xl': 30,
  '3xl': 38,
};

export const lineHeight = {
  tight:  1.2,
  normal: 1.5,
  loose:  1.8,
};

export const fontWeight = {
  regular: '400' as const,
  medium:  '500' as const,
  semibold:'600' as const,
  bold:    '700' as const,
};
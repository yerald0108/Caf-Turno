// src/ui/theme/colors.ts

export const palette = {
  // Base oscura — da sensación premium y reduce fatiga visual
  black:       '#0F0F14',
  surface0:    '#16161D',  // fondo principal
  surface1:    '#1E1E28',  // cards
  surface2:    '#26263A',  // inputs, elementos elevados
  surface3:    '#2E2E45',  // bordes visibles, separadores

  // Acento principal: naranja cálido (café, calor, energía)
  accent:      '#FF7A35',
  accentLight: '#FF9A62',
  accentDim:   '#FF7A3520',

  // Semánticos
  success:     '#34D399',
  successDim:  '#34D39918',
  danger:      '#F87171',
  dangerDim:   '#F8717118',
  warning:     '#FBBF24',
  warningDim:  '#FBBF2418',
  info:        '#60A5FA',
  infoDim:     '#60A5FA18',

  // Texto
  textPrimary:   '#F0F0F8',
  textSecondary: '#9090A8',
  textMuted:     '#5A5A72',
  textInverse:   '#0F0F14',

  // Transparencias
  overlay:       'rgba(0,0,0,0.6)',
  overlayLight:  'rgba(0,0,0,0.3)',
};

export type ColorKey = keyof typeof palette;
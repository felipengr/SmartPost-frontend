export const colors = {
  primary: '#06714A',
  primaryDark: '#045A3A',
  primaryLight: '#EAF6EE',
  accent: '#F08A24',
  danger: '#D93B3B',

  text: '#1A1F1C',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',

  background: '#FFFFFF',
  surface: '#F6F8F7',
  border: '#E5E7EB',

  cameraBg: '#1C211F',
  cameraFrame: '#2C322F',

  chip: {
    danger: { bg: '#FDECEC', fg: '#D93B3B' },
    warning: { bg: '#FDF3DC', fg: '#B7791F' },
    success: { bg: '#EAF6EE', fg: '#06714A' },
    info: { bg: '#E8F0FB', fg: '#2563EB' },
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

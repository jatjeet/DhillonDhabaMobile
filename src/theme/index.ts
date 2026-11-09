// Dhillon Dhaba Brand Theme — Authentic Punjabi Warmth & Modern Mobile UX

export const Colors = {
  primary: '#E65100',       // Rich Tandoori Saffron
  primaryLight: '#FF833A',  // Bright Saffron
  primaryDark: '#AC1900',   // Deep Charcoal Crimson
  accent: '#FFB300',        // Warm Amber / Mustard
  accentSoft: '#FFF3E0',    // Soft Butter Accent
  background: '#F8F9FA',    // Clean Light Canvas
  surface: '#FFFFFF',       // Card Surface
  surfaceMuted: '#F1F3F5',  // Subtle Grey Background
  
  text: '#1C1C1E',          // High Contrast Slate
  textMuted: '#666666',     // Secondary Label
  textLight: '#9E9E9E',     // Placeholder / Muted
  textInverse: '#FFFFFF',   // White Text

  border: '#E0E0E0',        // Light Divider
  borderFocus: '#E65100',   // Active Input Border
  
  // Food & Status Indicators
  veg: '#2E7D32',           // Green Veg Dot
  nonVeg: '#C62828',        // Crimson Non-Veg Dot
  spicyMild: '#4CAF50',
  spicyMedium: '#FF9800',
  spicyHot: '#D32F2F',

  badgeOpen: '#2E7D32',
  badgeClosed: '#D32F2F',
  badgePending: '#F57C00',
  badgeSuccess: '#2E7D32',
  
  cardShadow: 'rgba(0, 0, 0, 0.08)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  body: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  price: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primaryDark,
  },
};


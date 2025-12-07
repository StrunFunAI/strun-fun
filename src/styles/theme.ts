// Global theme configuration - STRUN Premium Design
// Inspired by Instagram + TikTok fluidity

export const theme = {
  colors: {
    // NEW DESIGN SYSTEM - Clean & Modern
    primary: '#0B0F1A',         // Dark Navy - Main background
    primaryLight: '#1A1F35',    // Slightly lighter for contrast
    accent: '#3B82F6',          // Electric Blue - CTA & active
    success: '#22C55E',         // Mint Green - Rewards
    warning: '#9CA3AF',         // Soft Gray - Disabled
    error: '#EF4444',           // Red - Errors
    background: '#F9FAFB',      // Light background
    cardBg: '#FFFFFF',          // Card background
    cardBgLight: '#F3F4F6',     // Light card background variant
    border: '#E5E7EB',          // Light border
    text: {
      primary: '#0B0F1A',       // Dark text on light BG
      secondary: '#6B7280',     // Medium gray
      muted: '#9CA3AF',         // Light gray
    },
    // Legacy gradients (keeping for compatibility)
    gradients: {
      primary: ['#3B82F6', '#2563EB'],
      success: ['#22C55E', '#16A34A'],
      warning: ['#F59E0B', '#D97706'],
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,        // Primary card radius (Instagram/TikTok style)
    xxl: 32,       // Bottom sheet radius
    full: 9999,
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  shadows: {
    sm: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 2,
    },
    md: {
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
      elevation: 4,
    },
    lg: {
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
      elevation: 8,
    },
  },
};

export const buttonStyles = {
  primary: {
    backgroundColor: theme.colors.accent,  // Electric Blue
    borderRadius: 14,                       // 14px per design
    paddingVertical: 16,                   // 52px height = 16 top + bottom padding
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  secondary: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  fab: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.accent,  // Use accent
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,                      // 12px per design
    backgroundColor: '#F3F4F6',             // Light gray background
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};

// Card styles
export const cardStyles = {
  default: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: 16,                      // 16px per design
    padding: 14,                           // 14px per design
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',  // Soft shadow
  },
  
  elevated: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: 16,
    padding: theme.spacing.lg,
    boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
  },
  
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
};

// Input styles
export const inputStyles = {
  default: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  focused: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
};

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  gradient?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  gradient = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.full,  // Fully rounded (pill shape)
      ...theme.shadows.md,
    };

    // Size
    switch (size) {
      case 'sm':
        base.paddingVertical = 10;
        base.paddingHorizontal = theme.spacing.md;
        base.height = 40;
        break;
      case 'lg':
        base.paddingVertical = theme.spacing.lg;
        base.paddingHorizontal = theme.spacing.xl;
        base.height = 56;
        break;
      default: // md
        base.paddingVertical = theme.spacing.md;
        base.paddingHorizontal = theme.spacing.lg;
        base.height = 52;
    }

    // Variant
    switch (variant) {
      case 'secondary':
        base.backgroundColor = theme.colors.cardBg;
        base.borderWidth = 1;
        base.borderColor = theme.colors.border;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        (base as any).boxShadow = 'none';
        base.elevation = 0;
        break;
      case 'danger':
        base.backgroundColor = theme.colors.error;
        break;
      default: // primary
        if (!gradient) {
          base.backgroundColor = theme.colors.accent;
        }
    }

    if (fullWidth) {
      base.width = '100%';
    }

    if (disabled) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextStyle = () => {
    const base: TextStyle = {
      color: theme.colors.text.primary,
      fontWeight: 'bold',
    };

    switch (size) {
      case 'sm':
        base.fontSize = theme.fontSize.sm;
        break;
      case 'lg':
        base.fontSize = theme.fontSize.lg;
        break;
      default:
        base.fontSize = theme.fontSize.md;
    }

    if (variant === 'ghost') {
      base.color = theme.colors.primary;
    }

    return base;
  };

  const renderIcon = () => {
    if (!icon || loading) return null;
    
    const iconSize = size === 'sm' ? 18 : size === 'lg' ? 24 : 20;
    const iconColor = variant === 'ghost' ? theme.colors.primary : theme.colors.text.primary;
    
    return (
      <Ionicons 
        name={icon as any} 
        size={iconSize} 
        color={iconColor}
        style={{ marginRight: iconPosition === 'left' ? theme.spacing.sm : 0, marginLeft: iconPosition === 'right' ? theme.spacing.sm : 0 }}
      />
    );
  };

  const content = (
    <>
      {loading && <ActivityIndicator size="small" color={theme.colors.text.primary} style={{ marginRight: theme.spacing.sm }} />}
      {!loading && iconPosition === 'left' && renderIcon()}
      {title && <Text style={[getTextStyle(), textStyle]}>{title}</Text>}
      {!loading && iconPosition === 'right' && renderIcon()}
    </>
  );

  if (gradient && variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[getButtonStyle(), style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={theme.colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientContent}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.8}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
  },
});

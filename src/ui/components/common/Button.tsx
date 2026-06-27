// src/ui/components/common/Button.tsx
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { palette, fontSize, borderRadius, spacing } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const handlePress = () => {
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? palette.textInverse : palette.textPrimary}
        />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`]]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },

  // Variantes
  primary: {
    backgroundColor: palette.accent,
  },
  secondary: {
    backgroundColor: palette.surface2,
    borderWidth: 1,
    borderColor: palette.surface3,
  },
  danger: {
    backgroundColor: palette.dangerDim,
    borderWidth: 1,
    borderColor: palette.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Labels
  label: {
    fontSize: fontSize.base,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  label_primary: {
    color: palette.textInverse,
  },
  label_secondary: {
    color: palette.textPrimary,
  },
  label_danger: {
    color: palette.danger,
  },
  label_ghost: {
    color: palette.accent,
  },
});
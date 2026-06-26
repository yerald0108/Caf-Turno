// src/ui/components/common/AppTextInput.tsx
import { useState } from 'react';
import {
  View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle,
} from 'react-native';
import { palette, fontSize, borderRadius, spacing } from '../../theme';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function AppTextInput({ label, error, containerStyle, style, ...props }: AppTextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={palette.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: palette.textSecondary,
    letterSpacing: 0.3,
  },
  input: {
    height: 50,
    backgroundColor: palette.surface2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.surface3,
    paddingHorizontal: spacing.base,
    fontSize: fontSize.base,
    color: palette.textPrimary,
  },
  inputFocused: {
    borderColor: palette.accent,
  },
  inputError: {
    borderColor: palette.danger,
  },
  error: {
    fontSize: fontSize.xs,
    color: palette.danger,
  },
});
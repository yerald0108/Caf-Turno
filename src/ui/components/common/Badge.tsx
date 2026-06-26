// src/ui/components/common/Badge.tsx
import { View, Text, StyleSheet } from 'react-native';
import { palette, fontSize, spacing, borderRadius } from '../../theme';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text style={[styles.label, styles[`label_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  success: { backgroundColor: palette.successDim },
  danger:  { backgroundColor: palette.dangerDim },
  warning: { backgroundColor: palette.warningDim },
  info:    { backgroundColor: palette.infoDim },
  neutral: { backgroundColor: palette.surface2 },

  label_success: { color: palette.success },
  label_danger:  { color: palette.danger },
  label_warning: { color: palette.warning },
  label_info:    { color: palette.info },
  label_neutral: { color: palette.textSecondary },
});
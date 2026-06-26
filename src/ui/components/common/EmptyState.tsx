// src/ui/components/common/EmptyState.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, fontSize, spacing } from '../../theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon as any} size={40} color={palette.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.sm,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: palette.textSecondary,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.sm,
    color: palette.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
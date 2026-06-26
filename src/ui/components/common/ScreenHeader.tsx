// src/ui/components/common/ScreenHeader.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { palette, fontSize, spacing } from '../../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
}

export function ScreenHeader({ title, subtitle, showBack = false, rightAction }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color={palette.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.iconButton}>
            <Ionicons name={rightAction.icon as any} size={24} color={palette.accent} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.surface0,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.surface3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: palette.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: palette.textSecondary,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 40,
  },
});
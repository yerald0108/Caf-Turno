// src/ui/components/common/Card.tsx
import { View, StyleSheet, ViewStyle } from 'react-native';
import { palette, borderRadius, spacing, shadow } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export function Card({ children, style, elevated = false }: CardProps) {
  return (
    <View style={[styles.card, elevated && shadow.md, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: palette.surface3,
  },
});
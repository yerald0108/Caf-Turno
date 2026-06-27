// src/ui/components/common/AnimatedCard.tsx
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { useFadeIn } from '../../hooks/useFadeIn';
import { palette, borderRadius, spacing, shadow } from '../../theme';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  delay?: number;
}

export function AnimatedCard({
  children, style, elevated = false, delay = 0,
}: AnimatedCardProps) {
  const { opacity, translateY } = useFadeIn(350, delay);

  return (
    <Animated.View
      style={[
        styles.card,
        elevated && shadow.md,
        style,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {children}
    </Animated.View>
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
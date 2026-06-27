// src/ui/components/common/SplashOverlay.tsx
import { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, fontSize, spacing } from '../../theme';

const { width, height } = Dimensions.get('window');

interface SplashOverlayProps {
  onFinish: () => void;
}

export function SplashOverlay({ onFinish }: SplashOverlayProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Icono aparece
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Texto aparece
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        delay: 100,
        useNativeDriver: true,
      }),
      // Pausa
      Animated.delay(600),
      // Todo desaparece
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Animated.View
        style={[
          styles.iconWrapper,
          { opacity: iconOpacity, transform: [{ scale }] },
        ]}
      >
        <Ionicons name="storefront" size={56} color={palette.accent} />
      </Animated.View>
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center', gap: spacing.xs }}>
        <Text style={styles.title}>CaféTurno</Text>
        <Text style={styles.subtitle}>Control de turnos</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: palette.surface0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    zIndex: 999,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: palette.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.accent + '40',
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: palette.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: palette.textSecondary,
    fontWeight: '400',
  },
});
// src/ui/components/common/AnimatedNumber.tsx
import { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  decimals?: number;
  style?: TextStyle;
  duration?: number;
}

export function AnimatedNumber({
  value,
  prefix = '',
  decimals = 2,
  style,
  duration = 800,
}: AnimatedNumberProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    animatedValue.addListener(({ value: v }) => {
      setDisplayValue(v);
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    return () => animatedValue.removeAllListeners();
  }, [value]);

  return (
    <Text style={style}>
      {prefix}{displayValue.toFixed(decimals)}
    </Text>
  );
}
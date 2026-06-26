// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, borderRadius, shadow } from '../../src/ui/theme';

interface TabIconProps {
  name: string;
  color: string;
  focused: boolean;
}

function TabIcon({ name, color, focused }: TabIconProps) {
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      <Ionicons name={name as any} size={22} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.sm },
        ],
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Turno',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'storefront' : 'storefront-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="productos"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'cube' : 'cube-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'time' : 'time-outline'} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: palette.surface1,
    borderTopWidth: 1,
    borderTopColor: palette.surface3,
    height: 64,
    ...shadow.md,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  iconWrapper: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  iconWrapperActive: {
    backgroundColor: palette.accentDim,
  },
});
// app/(tabs)/_layout.tsx
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, borderRadius, shadow, fontSize } from '../../src/ui/theme';
import TurnoScreen from './index';
import ProductosScreen from './productos';
import HistorialScreen from './historial';

const { width } = Dimensions.get('window');

const ROUTES = [
  { key: 'turno',     title: 'Turno',     icon: 'storefront',  iconOutline: 'storefront-outline'  },
  { key: 'productos', title: 'Productos', icon: 'cube',        iconOutline: 'cube-outline'        },
  { key: 'historial', title: 'Historial', icon: 'time',        iconOutline: 'time-outline'        },
];

const renderScene = SceneMap({
  turno:     TurnoScreen,
  productos: ProductosScreen,
  historial: HistorialScreen,
});

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);

  const renderTabBar = useCallback(() => {
    return (
      <View style={[styles.tabBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.sm }]}>
        {ROUTES.map((route, i) => {
          const focused = index === i;
          const color = focused ? palette.accent : palette.textMuted;
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={() => setIndex(i)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                <Ionicons
                  name={(focused ? route.icon : route.iconOutline) as any}
                  size={22}
                  color={color}
                />
              </View>
              <Text style={[styles.tabLabel, { color }]}>{route.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }, [index, insets]);

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes: ROUTES }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width }}
        renderTabBar={() => null}
        swipeEnabled
        animationEnabled
      />
      {renderTabBar()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.surface0,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: palette.surface1,
    borderTopWidth: 1,
    borderTopColor: palette.surface3,
    paddingTop: spacing.sm,
    ...shadow.md,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  iconWrapper: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  iconWrapperActive: {
    backgroundColor: palette.accentDim,
    borderWidth: 1,
    borderColor: palette.accent + '30',
  },
});
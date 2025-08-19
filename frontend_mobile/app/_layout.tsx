import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AppLayout from '@/components/custom/AppLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StartupFlow from '@/components/custom/StartupFlow';
import { AuthProvider } from '@/context/AuthContext';

// Layout wrapper with theme context integration
function NavigationRoot() {
  const { theme } = useTheme();
  const colorScheme = theme.dark ? 'dark' : 'light';
  
  // Use built-in navigation themes but customize them with our theme colors
  const navigationTheme = colorScheme === 'dark'
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.notification,
        }
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.notification,
        }
      };
  
  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }} initialRouteName='(auth)'>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="interview" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

// eslint-disable-next-line import/export
export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Thêm các font tùy chỉnh của bạn ở đây
    Inter: require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
  });

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout>
            <StartupFlow>
              <NavigationRoot />
            </StartupFlow>
          </AppLayout>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#190D38',
  },
});

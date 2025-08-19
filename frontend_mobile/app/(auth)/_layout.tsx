import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout() {
  const { theme } = useTheme();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(tabs)/home');
    }
  }, [isLoading, user]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Xác thực',
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: 'Đăng nhập',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Đăng ký',
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: 'Quên mật khẩu',
        }}
      />
    </Stack>
  );
}
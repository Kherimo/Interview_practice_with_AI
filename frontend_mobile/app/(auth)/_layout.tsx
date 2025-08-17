import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function AuthLayout() {
  const { theme } = useTheme();

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
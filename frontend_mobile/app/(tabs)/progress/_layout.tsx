import { Stack } from 'expo-router';
import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

export default function ProgressLayout() {
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
          title: 'Tiến độ',
        }}
      />
      {/* <Stack.Screen
        name="details"
        options={{
          title: 'Chi tiết tiến độ',
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          title: 'Phân tích',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="goals"
        options={{
          title: 'Mục tiêu',
        }}
      /> */}
    </Stack>
  );
}

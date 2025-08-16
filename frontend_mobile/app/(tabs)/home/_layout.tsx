import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';

export default function HomeLayout() {
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
          title: 'Trang chủ',
        }}
      />
      {/* <Stack.Screen
        name="practice"
        options={{
          title: 'Luyện tập',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="interview/[id]"
        options={{
          title: 'Phỏng vấn',
        }}
      />
      <Stack.Screen
        name="topic/[id]"
        options={{
          title: 'Chủ đề',
        }}
      />
      <Stack.Screen
        name="recommendations"
        options={{
          title: 'Đề xuất',
        }}
      /> */}
    </Stack>
  );
}

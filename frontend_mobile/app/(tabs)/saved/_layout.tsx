import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';

export default function SavedLayout() {
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
          title: 'Đã lưu',
        }}
      />
      {/* <Stack.Screen
        name="details/[id]"
        options={{
          title: 'Chi tiết kịch bản',
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          title: 'Danh mục',
        }}
      />
      <Stack.Screen
        name="practice"
        options={{
          title: 'Luyện tập',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Chỉnh sửa kịch bản',
        }}
      /> */}
    </Stack>
  );
}

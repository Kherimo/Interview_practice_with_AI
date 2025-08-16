import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '../../components/ui/IconSymbol';
import TabBarBackground from '../../components/ui/TabBarBackground';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.secondary, 
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)', 
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 60 + insets.bottom : 65,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          elevation: 8,
          borderTopWidth: 0,
          backgroundColor:  'rgba(30, 10, 60, 0.9)',
          position: 'absolute',
          left: 0,
          right: 0,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3, 
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarHideOnKeyboard: true,
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Tiến độ',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Lịch sử',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
          }}
        />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Đã lưu',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bookmark.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Cài đặt',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
      
      {/* Ẩn các màn hình phụ để tránh cảnh báo */}
      {/* <Tabs.Screen
        name="practice"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="interview/[id]"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="topic/[id]"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="recommendations"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="details"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="goals"
        options={{ href: null }}
      /> */}
    </Tabs>
  );
}

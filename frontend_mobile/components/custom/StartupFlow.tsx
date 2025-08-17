/**
 * StartupFlow.tsx
 * 
 * Component quản lý luồng khởi động của ứng dụng.
 * - Điều phối quá trình hiển thị các màn hình khi khởi động
 * - Quản lý trình tự: Loading -> SplashScreen -> OnboardingScreen -> Main App
 * - Xử lý preload tài nguyên (hình ảnh, dữ liệu)
 * - Kiểm tra trạng thái onboarding để quyết định có hiển thị hướng dẫn hay không
 * - Đảm bảo trải nghiệm mượt mà khi khởi động ứng dụng
 */
/**
 * StartupFlow.tsx
 * 
 * Component quản lý luồng khởi động của ứng dụng.
 * - Điều phối quá trình hiển thị các màn hình khi khởi động
 * - Quản lý trình tự: Loading -> SplashScreen -> OnboardingScreen -> Main App
 * - Xử lý preload tài nguyên (hình ảnh, dữ liệu)
 * - Kiểm tra trạng thái onboarding để quyết định có hiển thị hướng dẫn hay không
 * - Đảm bảo trải nghiệm mượt mà khi khởi động ứng dụng
 */
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Asset } from 'expo-asset';

import SplashScreen from '@/components/custom/SplashScreen';
import OnboardingScreen from '@/components/custom/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const bgImage = require('../../assets/images/background.png');

interface StartupFlowProps {
  children: React.ReactNode;
}

export default function StartupFlow({ children }: StartupFlowProps) {
  const [ready, setReady] = useState(false);
  const [isSplashVisible, setSplashVisible] = useState(true);
  const [isOnboardingCompleted, setOnboardingCompleted] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Kiểm tra Onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem('onboardingCompleted');
        if (completed === 'true') setOnboardingCompleted(true);
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  // Preload ảnh
  useEffect(() => {
    const preload = async () => {
      try {
        await Asset.fromModule(bgImage).downloadAsync();
        setReady(true);
      } catch (error) {
        console.error('Error preloading assets:', error);
      }
    };
    preload();
  }, []);

  // Loading khi chưa sẵn sàng
  if (!ready || checkingOnboarding) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Splash
  if (isSplashVisible) {
    return (
      <SplashScreen
        onFinish={() => setSplashVisible(false)}
        background={bgImage}
      />
    );
  }

  // Onboarding
  if (!isOnboardingCompleted) {
    return (
      <OnboardingScreen
        onFinish={async () => {
          await AsyncStorage.setItem('onboardingCompleted', 'true');
          setOnboardingCompleted(true);
        }}
      />
    );
  }

  // Sau khi splash + onboarding xong → render children
  return children;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#190D38',
  },
});

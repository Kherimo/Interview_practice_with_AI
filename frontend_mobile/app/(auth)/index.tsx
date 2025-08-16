import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';

// Chuyển hướng từ /auth đến /auth/login
export default function AuthIndex() {
  
 useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched) {
          // Đã từng mở app → đi thẳng login
          router.replace('/login');
        } else {
          // Lần đầu mở app → đánh dấu đã mở → vào register
          await AsyncStorage.setItem('hasLaunched', 'true');
          router.replace('/register');
        }
      } catch (err) {
        console.error(err);
        router.replace('/login'); // fallback
      }
    };

    checkFirstLaunch();
  }, []);

  return null; // không render gì cả
}

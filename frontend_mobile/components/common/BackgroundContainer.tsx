/**
 * BackgroundContainer.tsx
 * 
 * Container bọc ngoài cho các màn hình với hình nền chung.
 * - Tạo layout với hình nền thống nhất cho toàn bộ ứng dụng
 * - Hỗ trợ overlay tùy chỉnh để tăng độ tương phản
 * - Tích hợp SafeAreaView để tránh các vùng có notch hoặc các nút điều hướng hệ thống
 * - Tự động điều chỉnh kích thước theo màn hình thiết bị
 */
import React from 'react';
import { ImageBackground, StyleSheet, Dimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface BackgroundContainerProps {
  children: React.ReactNode;
  withOverlay?: boolean;
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ 
  children, 
  withOverlay = false 
}) => {
  return (
    <ImageBackground 
      source={require('../../assets/images/background.jpg')} 
      style={styles.background}
      resizeMode="cover"
    >
      {withOverlay && <View style={styles.overlay} />}
      <SafeAreaView style={styles.container}>
        {children}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  container: {
    flex: 1,
  },
});

export default BackgroundContainer;
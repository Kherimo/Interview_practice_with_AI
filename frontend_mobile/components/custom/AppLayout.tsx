// components/AppLayout.tsx
import { Dimensions, ImageBackground, StyleSheet, View } from 'react-native';
import React from 'react';
import { Images } from '@/constants/Image';


const { width, height } = Dimensions.get('window');
 function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ImageBackground
      source={Images.background}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.container}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    width: '100%',
    height: '100%', },
  container: { flex: 1}
});

export default AppLayout;
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BackgroundContainer from '../../../components/common/BackgroundContainer';
import { IconWrapper } from '../../../components/common/IconWrapper';

// App info
const APP_INFO = {
  name: "Interview Practice with AI",
  version: "1.0.0",
  releaseDate: "August 2025",
  developer: "NhiNguyen02",
  description: "Ứng dụng giúp người dùng thực hành phỏng vấn với AI, cải thiện kỹ năng giao tiếp và chuẩn bị tốt hơn cho các cuộc phỏng vấn thực tế.",
  website: "https://github.com/NhiNguyen02",
  email: "support@interviewwithAI.com"
};

export default function InformationScreen() {
  const router = useRouter();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Không thể mở liên kết', err));
  };

  return (
    <BackgroundContainer withOverlay={false}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconWrapper Component={Ionicons} name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin ứng dụng</Text>
          <View style={styles.backButton}>
            <IconWrapper Component={Ionicons} name="arrow-back" size={24} color="transparent" />
          </View>
        </View>
        
        {/* App Logo and Name */}
        <View style={styles.appInfoContainer}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/images/logo.jpg')} 
              style={styles.appLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>{APP_INFO.name}</Text>
          <Text style={styles.appVersion}>Phiên bản {APP_INFO.version}</Text>
        </View>
        
        {/* App Details */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phát hành:</Text>
              <Text style={styles.infoValue}>{APP_INFO.releaseDate}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phát triển bởi:</Text>
              <Text style={styles.infoValue}>{APP_INFO.developer}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Mô tả:</Text>
              <Text style={styles.infoValue}>{APP_INFO.description}</Text>
            </View>
          </View>
        </View>
        
        {/* Contact and Links */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Liên hệ & Liên kết</Text>
          
          <View style={styles.infoCard}>
            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => handleLinkPress(`mailto:${APP_INFO.email}`)}
            >
              <View style={styles.linkIconContainer}>
                <IconWrapper Component={Ionicons} name="mail" size={20} color="#fff" />
              </View>
              <Text style={styles.linkText}>{APP_INFO.email}</Text>
              <IconWrapper Component={Ionicons} name="open-outline" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => handleLinkPress(APP_INFO.website)}
            >
              <View style={styles.linkIconContainer}>
                <IconWrapper Component={Ionicons} name="globe" size={20} color="#fff" />
              </View>
              <Text style={styles.linkText}>Trang web chính thức</Text>
              <IconWrapper Component={Ionicons} name="open-outline" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.linkItem, {borderBottomWidth: 0}]}
              onPress={() => handleLinkPress('https://github.com/NhiNguyen02')}
            >
              <View style={styles.linkIconContainer}>
                <IconWrapper Component={Ionicons} name="logo-github" size={20} color="#fff" />
              </View>
              <Text style={styles.linkText}>GitHub</Text>
              <IconWrapper Component={Ionicons} name="open-outline" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Policies */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Chính sách</Text>
          
          <View style={styles.infoCard}>
            <TouchableOpacity 
              style={styles.linkItem}
              // Disabled until privacy-policy page is created
              onPress={() => {}}
            >
              <Text style={styles.linkText}>Chính sách bảo mật</Text>
              <IconWrapper Component={Ionicons} name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.linkItem, {borderBottomWidth: 0}]}
              // Disabled until terms-of-service page is created
              onPress={() => {}}
            >
              <Text style={styles.linkText}>Điều khoản sử dụng</Text>
              <IconWrapper Component={Ionicons} name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Copyright */}
        <View style={styles.copyrightContainer}>
          <Text style={styles.copyrightText}>
            © 2025 Interview Practice with AI. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 12,
    paddingBottom:12,
    paddingHorizontal: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  appInfoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  appLogo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  infoItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  linkIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  copyrightContainer: {
    marginTop: 10,
    marginBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  }
});

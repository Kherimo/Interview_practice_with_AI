import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  StatusBar,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BackgroundContainer from '../../../components/common/BackgroundContainer';
import InfoPopup from '../../../components/common/InfoPopup';
import { useLanguage, SupportedLanguage } from '../../../context/LanguageContext';
import { IconWrapper } from '../../../components/common/IconWrapper';

// Danh sách ngôn ngữ có sẵn
const LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt', nativeName: 'Tiếng Việt' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

export default function ChangeLanguageScreen() {
  const router = useRouter();
  const { language, changeLanguage } = useLanguage();
  
  // State for popup
  const [showInfo, setShowInfo] = useState(false);
  
  // Handle language change
  const handleLanguageChange = async (langCode: SupportedLanguage) => {
    await changeLanguage(langCode);
    setShowInfo(true);
  };
  
  // Scroll to the selected language when component mounts
  useEffect(() => {
    // Note: In a real implementation, you might want to scroll to the selected language
    // This would require getting a reference to the FlatList and calling scrollToItem
  }, []);

  // Render each language item
  const renderLanguageItem = ({ item }: { item: typeof LANGUAGES[0] }) => {
    const isSelected = item.code === language;
    
    return (
      <TouchableOpacity 
        style={[
          styles.languageItem,
          isSelected && styles.selectedLanguageItem
        ]}
        onPress={() => handleLanguageChange(item.code as SupportedLanguage)}
      >
        <View style={styles.languageInfo}>
          <Text style={styles.languageName}>{item.name}</Text>
          {item.name !== item.nativeName && (
            <Text style={styles.nativeName}>{item.nativeName}</Text>
          )}
        </View>
        
        {isSelected && (
          <View style={styles.checkContainer}>
            <IconWrapper Component={Ionicons} name="checkmark" size={22} color="#5ee7d9" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <BackgroundContainer withOverlay={false}>
      <StatusBar barStyle="light-content" />

      {/* Success Popup */}
      <InfoPopup
        visible={showInfo}
        title="Ngôn ngữ đã được cập nhật"
        message="Ngôn ngữ ứng dụng đã được thay đổi thành công!"
        onClose={() => {
          setShowInfo(false);
          router.back();
        }}
        type="success"
      />
      
            <View style={{flex: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconWrapper Component={Ionicons} name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thay đổi ngôn ngữ</Text>
          <View style={styles.backButton}>
            <IconWrapper Component={Ionicons} name="arrow-back" size={24} color="transparent" />
          </View>
        </View>
        
        {/* Language List */}
        <View style={styles.languageListContainer}>
          <FlatList
            data={LANGUAGES}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => String(item.code)}
            contentContainerStyle={styles.languageList}
          />
        </View>
        
        {/* Note */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            Lưu ý: Việc thay đổi ngôn ngữ sẽ áp dụng cho toàn bộ ứng dụng.
          </Text>
        </View>
      </View>
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 12,
    paddingBottom: 12,
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
  languageListContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
  },
  languageList: {
    paddingVertical: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  selectedLanguageItem: {
    backgroundColor: 'rgba(94, 231, 217, 0.1)',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  nativeName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(94, 231, 217, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  noteText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

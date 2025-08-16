import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BackgroundContainer from '../../../components/common/BackgroundContainer';
import { IconWrapper } from '../../../components/common/IconWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Loại thông báo
interface NotificationSetting {
  key: string;
  title: string;
  description: string;
  storageKey: string;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    key: 'practiceReminders',
    title: 'Nhắc nhở luyện tập',
    description: 'Nhận thông báo hàng ngày để nhắc bạn luyện tập phỏng vấn',
    storageKey: 'notification_practice_reminders',
  },
  {
    key: 'newFeatures',
    title: 'Tính năng mới',
    description: 'Thông báo khi có tính năng mới hoặc cập nhật nội dung',
    storageKey: 'notification_new_features',
  },
  {
    key: 'feedbackRequests',
    title: 'Yêu cầu phản hồi',
    description: 'Thông báo để yêu cầu phản hồi sau các buổi thực hành',
    storageKey: 'notification_feedback_requests',
  },
  {
    key: 'practiceResults',
    title: 'Kết quả thực hành',
    description: 'Thông báo khi có phân tích kết quả thực hành của bạn',
    storageKey: 'notification_practice_results',
  },
  {
    key: 'emailNotifications',
    title: 'Thông báo qua email',
    description: 'Nhận thông báo qua email thay vì thông báo trên ứng dụng',
    storageKey: 'notification_email',
  },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  // State cho các cài đặt thông báo
  const [settings, setSettings] = useState<Record<string, boolean>>({
    practiceReminders: true,
    newFeatures: true,
    feedbackRequests: true,
    practiceResults: true,
    emailNotifications: false,
  });
  
  const [masterSwitch, setMasterSwitch] = useState<boolean>(true);
  
  // Tải cài đặt thông báo từ AsyncStorage khi component được mount
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        // Tải trạng thái chính (master)
        const masterSwitchValue = await AsyncStorage.getItem('notifications_master_switch');
        if (masterSwitchValue !== null) {
          setMasterSwitch(masterSwitchValue === 'true');
        }
        
        // Tải từng cài đặt thông báo riêng lẻ
        const newSettings = { ...settings };
        for (const setting of NOTIFICATION_SETTINGS) {
          const value = await AsyncStorage.getItem(setting.storageKey);
          if (value !== null) {
            newSettings[setting.key] = value === 'true';
          }
        }
        setSettings(newSettings);
      } catch (error) {
        console.error('Lỗi khi tải cài đặt thông báo:', error);
      }
    };
    
    loadNotificationSettings();
  }, [settings]);

  // Lưu cài đặt thông báo xuống AsyncStorage
  const saveNotificationSetting = async (key: string, value: boolean) => {
    try {
      const setting = NOTIFICATION_SETTINGS.find(s => s.key === key);
      if (setting) {
        await AsyncStorage.setItem(setting.storageKey, value.toString());
      }
    } catch (error) {
      console.error('Lỗi khi lưu cài đặt thông báo:', error);
    }
  };

  // Lưu trạng thái master switch
  const saveMasterSwitchSetting = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('notifications_master_switch', value.toString());
    } catch (error) {
      console.error('Lỗi khi lưu trạng thái master switch:', error);
    }
  };

  // Xử lý khi toggle một cài đặt thông báo
  const toggleSetting = (key: string) => {
    const newValue = !settings[key];
    setSettings(prev => ({
      ...prev,
      [key]: newValue
    }));
    saveNotificationSetting(key, newValue);
  };

  // Xử lý khi toggle công tắc chính
  const toggleMasterSwitch = () => {
    const newMasterValue = !masterSwitch;
    setMasterSwitch(newMasterValue);
    saveMasterSwitchSetting(newMasterValue);
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
          <Text style={styles.headerTitle}>Cài đặt thông báo</Text>
          <View style={styles.backButton}>
            <IconWrapper Component={Ionicons} name="arrow-back" size={24} color="transparent" />
          </View>
        </View>
        
        {/* Master Switch */}
        <View style={styles.masterSwitchContainer}>
          <View style={styles.masterSwitchContent}>
            <View style={styles.masterIconContainer}>
              <IconWrapper Component={Ionicons} name="notifications" size={26} color="#fff" />
            </View>
            <View style={styles.masterSwitchInfo}>
              <Text style={styles.masterSwitchTitle}>Bật thông báo</Text>
              <Text style={styles.masterSwitchDescription}>
                Tắt để tắt tất cả thông báo từ ứng dụng
              </Text>
            </View>
          </View>
          <Switch
            value={masterSwitch}
            onValueChange={toggleMasterSwitch}
            trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: 'rgba(94, 231, 217, 0.3)' }}
            thumbColor={masterSwitch ? '#5ee7d9' : '#f4f3f4'}
            ios_backgroundColor="rgba(255, 255, 255, 0.1)"
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
        
        {/* Notification Settings List */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Loại thông báo</Text>
          
          {NOTIFICATION_SETTINGS.map((item) => (
            <View key={item.key} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingDescription}>{item.description}</Text>
              </View>
              <Switch
                value={masterSwitch ? settings[item.key] : false}
                onValueChange={() => toggleSetting(item.key)}
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: 'rgba(94, 231, 217, 0.3)' }}
                thumbColor={settings[item.key] && masterSwitch ? '#5ee7d9' : '#f4f3f4'}
                ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                disabled={!masterSwitch}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          ))}
        </View>
        
        {/* Note section */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            Lưu ý: Bạn cần cấp quyền thông báo cho ứng dụng trong cài đặt hệ thống của thiết bị để nhận thông báo.
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
  masterSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
  },
  masterSwitchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  masterIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(94, 231, 217, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  masterSwitchInfo: {
    flex: 1,
  },
  masterSwitchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  masterSwitchDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  settingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  noteContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  noteText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  }
});

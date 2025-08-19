import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BackgroundContainer from '../../../components/common/BackgroundContainer';
import InfoPopup from '../../../components/common/InfoPopup';
import { getCurrentUser, updateProfile } from '@/services/authService';
import { IconWrapper } from '../../../components/common/IconWrapper';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function EditProfileScreen() {
  const router = useRouter();
  
  // State for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState<string | undefined>(undefined);
  const [experience, setExperience] = useState<string | undefined>(undefined);
  const [showInfo, setShowInfo] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningTitle, setWarningTitle] = useState('');
  const [warningMessage, setWarningMessage] = useState('');

  const showWarningPopup = (title: string, message: string) => {
    setWarningTitle(title);
    setWarningMessage(message);
    setShowWarning(true);
  };
  
  useEffect(() => {
    const load = async () => {
      try {
        const me = await getCurrentUser();
        setName(me.name || '');
        setEmail(me.email || '');
        setOccupation(me.profession || undefined);
        setExperience(me.experience_level || undefined);
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  // Save changes and go back to profile
  const handleSaveChanges = async () => {
    if (!name || !email) {
      showWarningPopup('Lỗi', 'Vui lòng nhập đầy đủ họ tên và email');
      return;
    }
    if (!email.includes('@')) {
      showWarningPopup('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    try {
      await updateProfile({ name, email, profession: occupation, experience_level: experience });
      setShowInfo(true);
    } catch (e: any) {
      showWarningPopup('Lỗi', e?.message || 'Cập nhật hồ sơ thất bại');
    }
  };

  return (
    <BackgroundContainer withOverlay={false}>
      <StatusBar barStyle="light-content" />

      {/* Info Popup - shown after account deletion */}
      <InfoPopup
        visible={showInfo}
        title="Thông tin đã được cập nhật"
        message="Thông tin hồ sơ của bạn đã được cập nhật thành công!"
        onClose={() => {
          setShowInfo(false);
          router.back();
        }}
        type="success"
      />
      <InfoPopup
        visible={showWarning}
        title={warningTitle}
        message={warningMessage}
        onClose={() => setShowWarning(false)}
        type="warning"
      />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thay đổi hồ sơ</Text>
          <View style={styles.backButton}>
            <IconWrapper Component={Ionicons} name="arrow-back" size={24} color="transparent" />
          </View>
        </View>
        
        {/* Profile Photo */}
        <View style={styles.photoContainer}>
          <TouchableOpacity>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Image source={require('../../../assets/images/default-avatar.png')} style={styles.avatarImage} />
              </View>
              <TouchableOpacity style={styles.cameraButton}>
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          <Text style={styles.tapToChange}>Nhấn để thay đổi ảnh</Text>
        </View>
        
        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor="rgba(255,255,255,0.6)"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Địa chỉ Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="rgba(255,255,255,0.6)"
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nghề nghiệp</Text>
            <TouchableOpacity style={styles.selectInput}>
              <Text style={styles.selectText}>{occupation || 'Chưa cập nhật'}</Text>
              <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kinh nghiệm</Text>
            <TouchableOpacity style={styles.selectInput}>
              <Text style={styles.selectText}>{experience || 'Chưa cập nhật'}</Text>
              <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveChanges}
        >
          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </ScrollView>
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
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
  photoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#5ee7d9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#5ee7d9',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    position: 'absolute',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(79, 227, 230, 0.85)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  tapToChange: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  selectInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: 'rgba(79, 227, 230, 0.85)',
    borderRadius: 12,
    paddingVertical: 15,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

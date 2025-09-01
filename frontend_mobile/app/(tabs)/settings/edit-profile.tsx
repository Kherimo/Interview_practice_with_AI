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
import { Dropdown } from 'react-native-element-dropdown';
import { useAuth } from '@/context/AuthContext';

const FIELDS = [
  { label: 'IT', value: 'IT' },
  { label: 'Kinh doanh', value: 'Business' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Tài chính', value: 'Finance' },
  { label: 'Nhân sự', value: 'HR' },
];

const SPECIALIZATIONS_MAP: Record<string, { label: string; value: string }[]> = {
  IT: [
    { label: 'Frontend', value: 'Frontend' },
    { label: 'Backend', value: 'Backend' },
    { label: 'Mobile', value: 'Mobile' },
    { label: 'Data/AI', value: 'Data' },
    { label: 'QA/Tester', value: 'QA' },
    { label: 'DevOps', value: 'DevOps' },
    { label: 'Product', value: 'Product' },
  ],
  Business: [
    { label: 'Business Analyst', value: 'Business Analyst' },
    { label: 'Sales', value: 'Sales' },
    { label: 'Operations', value: 'Operations' },
    { label: 'Project Management', value: 'Project Management' },
  ],
  Marketing: [
    { label: 'Digital Marketing', value: 'Digital Marketing' },
    { label: 'Content', value: 'Content' },
    { label: 'Performance', value: 'Performance' },
    { label: 'SEO', value: 'SEO' },
  ],
  Finance: [
    { label: 'Accounting', value: 'Accounting' },
    { label: 'Auditing', value: 'Auditing' },
    { label: 'Investment', value: 'Investment' },
    { label: 'Financial Analysis', value: 'Financial Analysis' },
  ],
  HR: [
    { label: 'Recruitment', value: 'Recruitment' },
    { label: 'C&B', value: 'C&B' },
    { label: 'HRBP', value: 'HRBP' },
    { label: 'Training', value: 'Training' },
  ],
};

const EXPERIENCES = [
  { label: 'Fresher (0-1 năm)', value: 'fresher' },
  { label: 'Junior (1-3 năm)', value: 'junior' },
  { label: 'Middle (3-5 năm)', value: 'middle' },
  { label: 'Senior (5+ năm)', value: 'senior' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { handleTokenInvalid } = useAuth();
  
  // State for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [field, setField] = useState<string | null>(null);
  const [specialization, setSpecialization] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [isFocus, setIsFocus] = useState(false);
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
        
        // Parse profession to extract field and specialization
        if (me.profession) {
          const parts = me.profession.split(' - ');
          if (parts.length >= 2) {
            setField(parts[0]);
            setSpecialization(parts[1]);
          } else {
            setField(me.profession);
          }
        }
        setExperience(me.experience_level || null);
      } catch (e: any) {
        if (e?.name === 'TokenInvalid') {
          await handleTokenInvalid();
        }
      }
    };
    load();
  }, [handleTokenInvalid]);

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
      const profession = field && specialization ? `${field} - ${specialization}` : field || '';
      await updateProfile({ name, email, profession, experience_level: experience });
      setShowInfo(true);
    } catch (e: any) {
      if (e?.name === 'TokenInvalid') {
        await handleTokenInvalid();
      } else {
        showWarningPopup('Lỗi', e?.message || 'Cập nhật hồ sơ thất bại');
      }
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
            <Text style={styles.inputLabel}>Lĩnh vực</Text>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              itemContainerStyle={styles.itemContainerStyle}
              activeColor='#4ADEDE'
              itemTextStyle={{ color: '#ffffffff' }}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={FIELDS}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Chọn lĩnh vực"
              searchPlaceholder="Tìm kiếm..."
              value={field}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                setField(item.value);
                const specs = SPECIALIZATIONS_MAP[item.value] || [];
                setSpecialization(specs.length ? specs[0].value : null);
                setIsFocus(false);
              }}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Chuyên môn</Text>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              itemContainerStyle={styles.itemContainerStyle}
              activeColor='#4ADEDE'
              itemTextStyle={{ color: '#ffffffff' }}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={SPECIALIZATIONS_MAP[field || 'IT']}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Chọn chuyên môn"
              searchPlaceholder="Tìm kiếm..."
              value={specialization}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                setSpecialization(item.value);
                setIsFocus(false);
              }}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kinh nghiệm</Text>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              itemContainerStyle={styles.itemContainerStyle}
              activeColor='#4ADEDE'
              itemTextStyle={{ color: '#ffffffff' }}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={EXPERIENCES}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Chọn kinh nghiệm"
              searchPlaceholder="Tìm kiếm..."
              searchPlaceholderTextColor='#000'
              value={experience}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                setExperience(item.value);
                setIsFocus(false);
              }}
            />
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
  dropdown: {
    height: 45,
    borderColor: 'gray',
    backgroundColor: 'rgba(217, 217, 217, 0.15)',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dropdownContainer: {
    borderRadius:0,
    borderWidth: 0,
    padding: 0,
    backgroundColor: '#313674d5',
  },
  itemContainerStyle: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0.5,
    borderColor: 'rgba(217,217,217,0.8)',
  },
  placeholderStyle: {
    fontSize: 16,
    color:"#e6e6e6ff",
  },
  selectedTextStyle: {
    fontSize: 16,
    color:"#4ADEDE",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: '#FFFFFF',
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

// SetUpProfile.tsx
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundContainer from '../../components/common/BackgroundContainer';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { updateProfile, uploadAvatar } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import InfoPopup from '@/components/common/InfoPopup';
import AppLayout from '@/components/custom/AppLayout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';



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

const SetUpProfileScreen = () => {
  const [field, setField] = useState<string>(FIELDS[0].value);
  const [specialization, setSpecialization] = useState<string>(SPECIALIZATIONS_MAP[FIELDS[0].value][0].value);
  const [experienceLevel, setExperienceLevel] = useState<string>(EXPERIENCES[1].value);
  const [isFocus, setIsFocus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { updateUser } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [warningTitle, setWarningTitle] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [popupType, setPopupType] = useState<'info' | 'success' | 'warning' | 'error'>('warning');
  
  // Avatar states
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const showWarningPopup = (title: string, message: string) => {
    setWarningTitle(title);
    setWarningMessage(message);
    setShowWarning(true);
    setPopupType('warning');
  };

  const handleChangeAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setUploadingAvatar(true);
        const res = await uploadAvatar(uri);
        setSelectedAvatar(res.avatar_url);
        setUploadingAvatar(false);
      }
    } catch (e: any) {
      setUploadingAvatar(false);
      showWarningPopup('Lỗi', e?.message || 'Không thể cập nhật ảnh đại diện');
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      // Validation không cần thiết nữa vì các giá trị đã được khởi tạo với giá trị mặc định
      const profession = `${field} - ${specialization}`;
      
      // Cập nhật profile với avatar_url nếu có
      const updateData: any = { profession, experience_level: experienceLevel };
      if (selectedAvatar) {
        updateData.avatar_url = selectedAvatar;
      }
      
      await updateProfile(updateData);
      await updateUser({ profession, experienceLevel, profilePicture: selectedAvatar || undefined });
      
      // Hiển thị thông báo thành công
      setWarningTitle('Thành công');
      setWarningMessage('Thông tin hồ sơ đã được cập nhật thành công!');
      setPopupType('success');
      setShowWarning(true);
      
      // Chuyển về home sau 2 giây
      setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 2000);
    } catch (e) {
      setWarningTitle('Lỗi');
      setWarningMessage((e as any)?.message || 'Cập nhật hồ sơ thất bại');
      setPopupType('error');
      setShowWarning(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <AppLayout>
        <SafeAreaView style={{ flex: 1 }}>
          <View
              
              style={styles.background}
          >
              <InfoPopup
                visible={showWarning}
                title={warningTitle}
                message={warningMessage}
                onClose={() => setShowWarning(false)}
                type={popupType}
              />
              {/* Header */}
              <View style={styles.header}>
              <View style={{ width: 24 }} />
              <Text style={styles.headerTitle}>Thiết lập thông tin cá nhân</Text>
              <View style={{ width: 24 }} /> {/* giữ cân đối */}
              </View>

              {/* Nội dung */}
              <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.title}>Hãy chia sẻ đôi nét về bạn</Text>
              <Text style={styles.subtitle}>
                  Điều này sẽ giúp chúng tôi cá nhân hóa buổi luyện phỏng vấn cho bạn.
              </Text>

              {/* Avatar - Optional */}
              <View style={styles.avatarWrapper}>
                <TouchableOpacity onPress={handleChangeAvatar} disabled={uploadingAvatar}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      {selectedAvatar ? (
                        <Image source={{ uri: selectedAvatar }} style={styles.avatarImage} />
                      ) : (
                        <Ionicons name="person" size={48} color="#7CF3FF" />
                      )}
                      {uploadingAvatar && (
                        <View style={styles.avatarLoadingOverlay}>
                          <ActivityIndicator color="#fff" size="small" />
                        </View>
                      )}
                    </View>
                    <TouchableOpacity style={styles.cameraButton} disabled={uploadingAvatar}>
                      <Ionicons name="camera" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
                <Text style={styles.tapToChange}>
                  {uploadingAvatar ? 'Đang tải...' : 'Nhấn để thay đổi ảnh (Tùy chọn)'}
                </Text>
              </View>

              {/* Form */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Lĩnh vực</Text>
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
                  placeholder={FIELDS[0].label}
                  searchPlaceholder="Tìm kiếm..."
                  value={field}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setField(item.value);
                    const specs = SPECIALIZATIONS_MAP[item.value] || [];
                    setSpecialization(specs.length ? specs[0].value : SPECIALIZATIONS_MAP[FIELDS[0].value][0].value);
                    setIsFocus(false);
                  }}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Chuyên môn</Text>
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
                  data={SPECIALIZATIONS_MAP[field]}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={(SPECIALIZATIONS_MAP[field][0] || { label: 'Chọn chuyên môn' }).label}
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
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Kinh nghiệm làm việc</Text>
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
                  placeholder={EXPERIENCES[1].label}
                  searchPlaceholder="Tìm kiếm..."
                  searchPlaceholderTextColor='#000'
                  value={experienceLevel}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setExperienceLevel(item.value);
                    setIsFocus(false);
                  }}
                />
              </View>

              {/* Button */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitText}>Cập nhật</Text>
                  )}
              </TouchableOpacity>
              </ScrollView>
          </View>
        </SafeAreaView>
      </AppLayout>
  );
};

export default SetUpProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  content: {flex:1,justifyContent:'center', padding: 20 },
  inputContainer: {
    marginBottom: 16,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 6 },
  subtitle: { color: "#aaa", fontSize: 14, textAlign: "center", marginBottom: 20 },
  avatarWrapper: { alignItems: "center", marginBottom: 20 },
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    position: 'absolute',
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 14,
    borderRadius: 12,
    color: "#fff",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
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
  submitBtn: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#00D4FF",
    marginTop: 20,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});


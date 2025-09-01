// SetUpProfile.tsx
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundContainer from '../../components/common/BackgroundContainer';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { updateProfile } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import InfoPopup from '@/components/common/InfoPopup';
import AppLayout from '@/components/custom/AppLayout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';



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
  const [field, setField] = useState<string | null>(FIELDS[0].value);
  const [specialization, setSpecialization] = useState<string | null>(SPECIALIZATIONS_MAP[FIELDS[0].value][0].value);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(EXPERIENCES[1].value);
  const [isFocus, setIsFocus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { updateUser } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [warningTitle, setWarningTitle] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [popupType, setPopupType] = useState<'info' | 'success' | 'warning' | 'error'>('warning');

  const showWarningPopup = (title: string, message: string) => {
    setWarningTitle(title);
    setWarningMessage(message);
    setShowWarning(true);
    setPopupType('warning');
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (!field || !specialization || !experienceLevel) {
        showWarningPopup('Lỗi', 'Vui lòng chọn đầy đủ lĩnh vực, chuyên môn và kinh nghiệm');
        return;
      }
      const profession = `${field} - ${specialization}`;
      await updateProfile({ profession, experience_level: experienceLevel });
      await updateUser({ profession, experienceLevel });
      router.push('/(tabs)/home');
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
              <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
                  <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Thiết lập thông tin cá nhân</Text>
              <View style={{ width: 24 }} /> {/* giữ cân đối */}
              </View>

              {/* Nội dung */}
              <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.title}>Hãy chia sẻ đôi nét về bạn</Text>
              <Text style={styles.subtitle}>
                  Điều này sẽ giúp chúng tôi cá nhân hóa buổi luyện phỏng vấn cho bạn.
              </Text>

              {/* Avatar */}
              <View style={styles.avatarWrapper}>
                  <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={48} color="#7CF3FF" />
                  </View>
                  <TouchableOpacity style={styles.changeBtn}>
                  <Text style={styles.changeText}>Thay đổi</Text>
                  </TouchableOpacity>
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
                    setSpecialization(specs.length ? specs[0].value : null);
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
                  data={SPECIALIZATIONS_MAP[field || 'IT']}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={(SPECIALIZATIONS_MAP[field || 'IT'][0] || { label: 'Chọn chuyên môn' }).label}
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
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  changeBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
  },
  changeText: { color: "#fff", fontSize: 13 },
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


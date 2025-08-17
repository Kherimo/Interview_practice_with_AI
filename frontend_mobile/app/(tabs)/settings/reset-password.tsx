import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BackgroundContainer from '../../../components/common/BackgroundContainer';
import { IconWrapper } from '../../../components/common/IconWrapper';
import InfoPopup from '../../../components/common/InfoPopup';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for popups
  const [showWarning, setShowWarning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Popup content
  const [warningTitle, setWarningTitle] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  
  // Show warning popup
  const showWarningPopup = (title: string, message: string) => {
    setWarningTitle(title);
    setWarningMessage(message);
    setShowWarning(true);
  };
  
  // Đổi mật khẩu
  const handleResetPassword = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!currentPassword || !newPassword || !confirmPassword) {
      showWarningPopup('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showWarningPopup('Lỗi', 'Mật khẩu xác nhận không khớp với mật khẩu mới');
      return;
    }
    
    if (newPassword.length < 6) {
      showWarningPopup('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Mô phỏng thời gian xử lý API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Thêm logic gọi API đổi mật khẩu thực tế ở đây
      // await authAPI.changePassword({ currentPassword, newPassword });
      
      setShowSuccess(true);
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      showWarningPopup('Lỗi', 'Không thể đổi mật khẩu. Vui lòng thử lại sau.');
      console.error('Error resetting password:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Xử lý quên mật khẩu - điều hướng đến màn hình quên mật khẩu
  const handleForgotPassword = () => {
    // Điều hướng đến màn hình quên mật khẩu sử dụng đường dẫn tuyệt đối
    router.push('/(auth)/forgot-password');
  };

  return (
    <BackgroundContainer withOverlay={false}>
      <StatusBar barStyle="light-content" />
      
      {/* Warning Popup */}
      <InfoPopup
        visible={showWarning}
        title={warningTitle}
        message={warningMessage}
        onClose={() => setShowWarning(false)}
        type="warning"
      />
      
      {/* Success Popup */}
      <InfoPopup
        visible={showSuccess}
        title="Thành công"
        message="Mật khẩu của bạn đã được thay đổi thành công!"
        onClose={() => {
          setShowSuccess(false);
          router.back();
        }}
        type="success"
      />
      
      {/* Removed the Forgot Password Confirm Popup since we now navigate directly */}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <IconWrapper Component={Ionicons} name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
              <View style={styles.backButton}>
                <IconWrapper Component={Ionicons} name="arrow-back" size={24} color="transparent" />
              </View>
            </View>
            
            {/* Content Container */}
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal:20, paddingVertical:30, borderWidth:1}}
              
            >
              <View style={styles.contentContainer}>
                {/* Icon */}
              <View style={styles.iconContainer}>
                <IconWrapper Component={Ionicons} name="key" size={30} color="#fff" />
              </View>
              
              <Text style={styles.title}>Đổi mật khẩu</Text>
              <Text style={styles.subtitle}>Nhập mã xác thực và mật khẩu mới</Text>
              
              {/* Form */}
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mật khẩu cũ</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập mật khẩu cũ"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      secureTextEntry={!showCurrentPassword}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <IconWrapper 
                        Component={Ionicons} 
                        name={showCurrentPassword ? "eye-off" : "eye"} 
                        size={22} 
                        color="rgba(255,255,255,0.7)" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập mật khẩu mới"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      secureTextEntry={!showNewPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <IconWrapper 
                        Component={Ionicons} 
                        name={showNewPassword ? "eye-off" : "eye"} 
                        size={22} 
                        color="rgba(255,255,255,0.7)" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập lại mật khẩu mới"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <IconWrapper 
                        Component={Ionicons} 
                        name={showConfirmPassword ? "eye-off" : "eye"} 
                        size={22} 
                        color="rgba(255,255,255,0.7)" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Reset Password Button */}
                <TouchableOpacity
                  style={[styles.resetButton, isSubmitting && styles.resetButtonDisabled]}
                  onPress={handleResetPassword}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.resetButtonText}>Đặt lại mật khẩu</Text>
                  )}
                </TouchableOpacity>
                
                {/* Forgot Password */}
                <TouchableOpacity 
                  style={styles.forgotPasswordContainer}
                  onPress={handleForgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  header: {
    paddingTop: 12,
    paddingBottom:12,
    paddingHorizontal: 10,
    
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
  contentContainer: {

    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(94, 231, 217, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#5ee7d9',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#5ee7d9',
    fontSize: 14,
    fontWeight: '500',
  }
});

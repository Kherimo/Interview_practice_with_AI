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
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BackgroundContainer from '../../components/common/BackgroundContainer';
import { IconWrapper } from '../../components/common/IconWrapper';
import InfoPopup from '../../components/common/InfoPopup';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
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
  
  // Gửi mã xác thực
  const handleSendVerificationCode = async () => {
    // Validate email
    if (!email || !email.includes('@')) {
      showWarningPopup('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Mô phỏng thời gian xử lý API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Hiển thị thành công
      setShowSuccess(true);
    } catch {
      showWarningPopup('Lỗi', 'Không thể gửi mã xác thực. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
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
        message="Mã xác thực đã được gửi đến email của bạn!"
        onClose={() => {
          setShowSuccess(false);
          router.replace('/login');
        }}
        type="success"
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Header */}
            {/* <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <IconWrapper Component={Ionicons} name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Quên mật khẩu</Text>
                <View style={styles.backButton}>
              <IconWrapper Component={Ionicons} name="arrow-back" size={24} color="transparent" />
          </View>
            </View> */}
            
            {/* Content Container */}
            <View style={styles.contentContainer}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <IconWrapper Component={Ionicons} name="lock-open" size={30} color="#fff" />
              </View>
              
              <Text style={styles.title}>Quên mật khẩu?</Text>
              <Text style={styles.subtitle}>Vui lòng nhập email để nhận mã xác thực</Text>
              
              {/* Form */}
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập địa chỉ email của bạn"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>
                
                {/* Send Button */}
                <TouchableOpacity
                  style={[styles.sendButton, isSubmitting && styles.sendButtonDisabled]}
                  onPress={handleSendVerificationCode}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.sendButtonText}>Gửi mã xác thực</Text>
                  )}
                </TouchableOpacity>
                
                {/* Remember Password */}
                <TouchableOpacity 
                  style={styles.rememberPasswordContainer}
                  onPress={() => router.push('/login')}
                >
                  <Text style={styles.rememberPasswordText}>Nhớ mật khẩu? <Text style={styles.loginText}>Đăng nhập</Text></Text>
                </TouchableOpacity>
              </View>
            </View>
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
  inner: {
    flex: 1,
    justifyContent: 'flex-start',
    
  },
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 30,
    justifyContent:'center'
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    maxWidth: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  sendButton: {
    height: 50,
    backgroundColor: '#5ee7d9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: '#1a2744',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rememberPasswordContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  rememberPasswordText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  loginText: {
    color: '#5ee7d9',
    fontWeight: 'bold',
  }
});
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import AppLayout from '@/components/custom/AppLayout'
import { IconSymbol } from '@/components/ui/IconSymbol'
import ButtonCustom from '@/components/custom/ButtonCustom'
import { useRouter } from 'expo-router'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import InfoPopup from '@/components/common/InfoPopup'

const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const {theme} = useTheme();
  const { signIn } = useAuth();
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

  const handleLogin = async () => {
    if (!email || !password) {
      showWarningPopup('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }
    if (!email.includes('@')) {
      showWarningPopup('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    const result = await signIn(email, password);
    if (!result.ok) {
      setWarningTitle('Lỗi');
      setWarningMessage(result.error || 'Email hoặc mật khẩu không đúng');
      setPopupType('error');
      setShowWarning(true);
    }
  }

  return (
    <AppLayout>
      <InfoPopup
        visible={showWarning}
        title={warningTitle}
        message={warningMessage}
        onClose={() => setShowWarning(false)}
        type={popupType}
      />
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Đăng nhập vào tài khoản của bạn</Text>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@gmail.com"
            placeholderTextColor="#C2C2C2"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Mật khẩu */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#C2C2C2"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <IconSymbol
                name={showPassword ? "eye.slash.fill" : "eye.fill"}
                size={22}
                color="#B0B3B8"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quên mật khẩu */}
        <TouchableOpacity
          onPress={() => {
            router.push("/(auth)/forgot-password");
          }}
          style={{ marginBottom: 20, width: 200, maxWidth: "100%" }}
        >
          <Text style={styles.forgot}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <ButtonCustom
          title="Đăng nhập"
          onPress={handleLogin}
          buttonStyle={{ backgroundColor: theme.colors.secondary, borderRadius: 12, marginBottom:10 }}
          textStyle={{ fontSize: 16, fontWeight: 'bold' }}
        />

        {/* Chuyển sang Đăng ký */}
        <View style={styles.bottomText}>
          <Text style={{ color: "#C2C2C2" }}>Bạn chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
            <Text style={{ color: theme.colors.secondary, fontWeight: "600" }}>
              Đăng ký
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppLayout>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#C2C2C2",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  input: {
    height: 48,
    fontSize: 16,
    paddingLeft: 16,
    paddingRight: 40,
    borderRadius: 12,
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: "rgba(217,217,217,0.15)",
    color: "#fff",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -11 }],
  },
  forgot: {
    color: "#C2C2C2",
    fontSize: 14,
  },
  bottomText: {
    flexDirection: "row",
    justifyContent: "center",
  },
});

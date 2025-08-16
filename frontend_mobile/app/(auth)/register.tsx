import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import AppLayout from '@/components/custom/AppLayout';
import { Colors } from '@/constants/Colors';
import Checkbox from 'expo-checkbox';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ButtonCustom from '@/components/custom/ButtonCustom';
import { useRouter } from 'expo-router';

const RegisterScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecked, setChecked] = useState(false);
  const router = useRouter();

  return (
    <AppLayout>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.title}>Đăng ký</Text>
        <Text style={styles.subtitle}>Tạo tài khoản mới</Text>

        {/* Họ và tên */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ và tên"
            placeholderTextColor="#C2C2C2"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="a@gmail.com"
            placeholderTextColor="#C2C2C2"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Mật khẩu */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
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
                name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                size={22}
                color="#B0B3B8"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Checkbox điều khoản */}
        <View style={styles.checkboxRow}>
          <Checkbox
            color={'rgba(217, 217, 217, 0.15)'}
            value={isChecked}
            onValueChange={setChecked}
          />
          <Text style={styles.checkboxText}>
            Tôi đồng ý với các
            <Text style={styles.linkText}> Điều khoản</Text> và
            <Text style={styles.linkText}> Chính sách bảo mật</Text>
          </Text>
        </View>

        {/* Button Đăng ký */}
        <ButtonCustom
          title="Đăng ký"
          onPress={() => console.log('Đăng ký')}
          buttonStyle={{ backgroundColor: Colors.aqua, borderRadius: 12, marginBottom: 10 }}
          textStyle={{ fontSize: 16, fontWeight: 'bold' }}
        />

        {/* Chuyển sang Đăng nhập */}
        <View style={styles.bottomText}>
          <Text style={{ color: '#C2C2C2' }}>Bạn đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={{ color: Colors.aqua, fontWeight: '600' }}>
              Đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppLayout>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#C2C2C2',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    height: 48,
    fontSize: 16,
    paddingLeft: 16,
    paddingRight: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(217,217,217,0.15)',
    color: '#fff',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -11 }],
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  linkText: {
    color: Colors.aqua,
    fontWeight: '600',
  },
  bottomText: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

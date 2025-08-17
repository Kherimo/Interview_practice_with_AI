// SplashScreen.tsx
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundContainer from '../../components/common/BackgroundContainer';
import { Ionicons } from '@expo/vector-icons';



const SetUpProfileScreen = () => {
  
  return (
      <BackgroundContainer>
        <View
            
            style={styles.background}
        >
            {/* Header */}
            <View style={styles.header}>
            <TouchableOpacity>
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
              <Text style={styles.label}>Nghề nghiệp</Text>
              <TextInput
                  placeholder="Software Engineering"
                  placeholderTextColor="#ccc"
                  style={styles.input}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Kinh nghiệm làm việc</Text>
              <TextInput
                  placeholder="Junior"
                  placeholderTextColor="#ccc"
                  style={styles.input}
              />
            </View>

            {/* Button */}
            <TouchableOpacity style={styles.submitBtn}>
                <Text style={styles.submitText}>Cập nhật</Text>
            </TouchableOpacity>
            </ScrollView>
        </View>
        </BackgroundContainer>
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


import React, { useState } from "react";
import { Modal, View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InterviewChat from "@/components/interviewChat";// file chat bạn có sẵn
import AppLayout from "./custom/AppLayout";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";


const ChatFloating = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* Cửa sổ chat */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <AppLayout>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                        Trợ lý AI
                    </Text>
                    <TouchableOpacity onPress={() => setVisible(false)}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    </View>

                    {/* Chat UI */}
                    <View style={{ flex: 1 }}>
                    <InterviewChat />
                    </View>
                </View>
                </View>
            </SafeAreaView>
        </AppLayout>
      </Modal>

      {/* FAB: chỉ hiện khi visible = false */}
      {!visible && (
        <LinearGradient
            colors={['rgba(86,0,255,1)', 'rgba(0,201,255,1)']}
            start={{ x: 0.05, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
            >
                <TouchableOpacity
                    onPress={() => setVisible(true)}
                    activeOpacity={0.9}
                >
                    <Ionicons name="chatbubbles" size={24} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>
        )}
    </>
  );
};

export default ChatFloating;


const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    zIndex: 1000,
    borderRadius: 30,
    // backgroundColor: "#4D4D4D",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: "transparent", // overlay che toàn màn hình
  justifyContent: "flex-end",          // đẩy modalContent xuống cuối
},
modalContent: {
  height: "100%",                        // panel chiếm 80% màn hình
  backgroundColor: "transparent",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  overflow: "hidden",
},
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor:'transparent',
    borderBottomColor: "rgba(236, 232, 232, 0.18)",
    borderBottomWidth: 1,
  },
});

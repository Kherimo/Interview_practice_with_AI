import { FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import {Ionicons,Feather} from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundContainer from '@/components/common/BackgroundContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import AppLayout from '@/components/custom/AppLayout';

type Msg = {
  id: string;
  text: string;
  sender: "bot" | "user";
};

const InterviewChat = () => {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m1", text: "Xin chào 👋! Tôi có thể giúp gì cho bạn trong buổi luyện phỏng vấn hôm nay?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Msg>>(null);

  // gửi tin nhắn user
  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg: Msg = {
      id: String(Date.now()),
      text: trimmed,
      sender: "user"
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    scrollToEndNext();

    // mô phỏng bot trả lời
    setTimeout(() => {
      const bot: Msg = {
        id: String(Date.now() + 1),
        text: `Bạn vừa hỏi: "${trimmed}". Đây là câu trả lời demo của bot 🤖`,
        sender: "bot"
      };
      setMessages((prev) => [...prev, bot]);
      scrollToEndNext();
    }, 700);
  };

  const scrollToEndNext = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const isBot = item.sender === "bot";

    return (
      <View style={[styles.row, isBot ? styles.left : styles.right]}>
        {isBot ? (
          <>
            <Image source={require('@/assets/images/roboticon.png')} style={{ width: 35, height: 35, marginRight: 6 }} />
            <View style={[styles.bubble, styles.botBubble]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
            </View>
          </>
        ) : (
          <>
            <View style={[styles.bubble, styles.userBubble]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
            </View>
            <View style={styles.avatarUser}>
              <Image source={require('@/assets/images/default-avatar.png')} style={{ width: 35, height: 35 }} />
            </View>
          </>
        )}
      </View>
    );
  };

 return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
    keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 10 : 0}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.fill}>
        
        {/* Chat list */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 10 }}
          onContentSizeChange={scrollToEndNext}
        />

        {/* Input bar */}
        <View style={[styles.inputBar, { marginBottom: insets.bottom }]}>
          <TextInput
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={input}
            onChangeText={setInput}
            multiline
            textAlignVertical="center"
            style={styles.input}
          />
          <TouchableOpacity onPress={send} style={styles.sendBtn}>
            <Ionicons name="send" size={20} color="#0CE7FF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);

}

export default InterviewChat

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontWeight: 'bold',
    fontSize: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  left: { justifyContent: "flex-start" },
  right: { justifyContent: "flex-end" },
  avatarUser: {
    width: 35,
    height: 35,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#B892FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  bubble: {
    maxWidth: "68%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  botBubble: {
    backgroundColor: "rgba(172, 229, 255, 0.25)",
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderTopRightRadius: 4,
  },
  bubbleText: { color: "#fff", fontSize: 14, lineHeight: 20 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    // borderRadius: 10,
    paddingLeft: 14,
    paddingRight: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 120,
    color: "#fff",
    fontSize: 14,
    paddingVertical: 6,
    paddingRight: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

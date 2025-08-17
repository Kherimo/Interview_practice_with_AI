import { FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import {Ionicons,Feather} from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BackgroundContainer from '@/components/common/BackgroundContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';


type Msg = {
  id: string;
  text: string;
  sender: "bot" | "user";
};

const initialBotText =
  "Hãy mô tả kinh nghiệm của bạn với các phương pháp phát triển phần mềm Agile và cách bạn đã áp dụng chúng vào các dự án của mình.";
const InterviewChat = () => {
  const [stage, setStage] = useState<1 | 2 | 3>(1);

  const [messages, setMessages] = useState<Msg[]>([
    { id: "m1", text: initialBotText, sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Msg>>(null);

  const showSuggestionFab = useMemo(
    () => stage === 1 || stage === 2,
    [stage]
  );


  
  const onPressSuggestionPrimary = () => {
    // ví dụ: bot gửi thêm gợi ý → sang màn 2
    if (stage === 1) {
      const m2: Msg = {
        id: String(Date.now()),
        text:
          "Bạn có thể nêu cụ thể một sprint gần đây: mục tiêu, vai trò của bạn, và kết quả?",
        sender: "bot"
      };
      setMessages((prev) => [...prev, m2]);
      setStage(2);
      scrollToEndNext();
    }
  };

  const onPressSuggestionProfile = () => {
    // có thể mở profile/cài đặt… mock tạm 1 tin bot nữa
    const m: Msg = {
      id: String(Date.now()),
      text: "Bạn muốn luyện theo vị trí: Frontend, Backend hay Full-stack?",
      sender: "bot"
    };
    setMessages((p) => [...p, m]);
    if (stage === 1) setStage(2);
    scrollToEndNext();
  };

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
    if (stage !== 3) setStage(3);
    scrollToEndNext();

    // mock bot phản hồi nhẹ
    setTimeout(() => {
      const bot: Msg = {
        id: String(Date.now() + 1),
        text:
          "Cảm ơn bạn! Bạn có thể mô tả rõ hơn vai trò và kết quả đo lường được không?",
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

  const renderItem = ({ item, index }: { item: Msg; index: number }) => {
    const isBot = item.sender === "bot";
    const isLast = index === messages.length - 1;

    return (
      
      <View style={[styles.row, isBot ? styles.left : styles.right]}>
        {/* avatar */}
        {isBot ? (
          <>
            <View>
              <Image source={require('@/assets/images/roboticon.png')} style={{ width: 35, height: 35 }} />
            </View>
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

        {/* cụm nút gợi ý chỉ hiện cạnh tin bot cuối (stage 1/2) */}
        {isBot && isLast && showSuggestionFab && (
          <View style={styles.suggestionGroup}>
            <TouchableOpacity style={styles.suggestionBtn} onPress={onPressSuggestionPrimary}>
              <Feather name="more-horizontal" size={18} color="#111" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.suggestionBtn, { marginTop: 10 }]} onPress={onPressSuggestionProfile}>
              <Ionicons name="person" size={18} color="#111" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <BackgroundContainer>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // offset trên iOS
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.fill}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={()=>{router.replace('/(tabs)/home')}} style={styles.backBtn}>
                <IconSymbol name="chevron.left" size={30} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.title}>Software Engineering</Text>
              <View style={{ width: 32 }} />
            </View>

            {/* Chat list */}
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(m) => m.id}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16, paddingBottom: 10 }}
              onContentSizeChange={scrollToEndNext}
            />

            {/* Input bar nổi trên bàn phím */}
            <View style={[styles.inputBar, { marginBottom: insets.bottom }]}>
              <TextInput
                placeholder="Nhập câu trả lời của bạn…"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={input}
                onChangeText={setInput}
                style={styles.input}
                multiline
              />
              <TouchableOpacity onPress={send} style={styles.sendBtn}>
                <Ionicons name="send" size={20} color="#0CE7FF" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </BackgroundContainer>
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

  avatarBot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#7DF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
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

  suggestionGroup: {
    marginLeft: 8,
    alignSelf: "flex-start",
    alignItems: "center",
  },
  suggestionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  inputBar: {
    
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
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
})
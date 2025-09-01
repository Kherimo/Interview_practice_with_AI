import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext'; 
import BackgroundContainer from '../../../components/common/BackgroundContainer';
import { getAnswerDetail } from '@/services/interviewService';
import InfoPopup from '../../../components/common/InfoPopup';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Định nghĩa type cho chi tiết câu trả lời
type ResultAnswerDetail = {
  id: string;
  questionId: string;
  question: string;
  answer: string;
  score: number; // 0..10
  overallScore: {
    speaking: number;
    content: number;
    relevance: number;
  };
  feedback: string;
  strengths: string[];
  improvements: string[];
  interviewId: string;
  interviewTitle: string;
};

// Removed mock; fetch from backend

export default function ResultAnswerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ questionId?: string, interviewId?: string }>();
  const { theme } = useTheme();
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<{
    question: string;
    answer: string;
    score: number;
    overallScore: { speaking: number; content: number; relevance: number };
    feedback: string;
    strengths: string[];
    improvements: string[];
    interviewTitle: string;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!params?.interviewId || !params?.questionId) return;
        const res = await getAnswerDetail(String(params.interviewId), String(params.questionId));
        const ans = res?.answer;
        const mapped = {
          question: ans?.question || '',
          answer: ans?.answer || '',
          score: Number(ans?.score || 0),
          overallScore: {
            speaking: Number(ans?.overallScore?.speaking || 0),
            content: Number(ans?.overallScore?.content || 0),
            relevance: Number(ans?.overallScore?.relevance || 0),
          },
          feedback: ans?.feedback || '',
          strengths: Array.isArray(ans?.strengths) ? ans.strengths : [],
          improvements: Array.isArray(ans?.improvements) ? ans.improvements : [],
          interviewTitle: 'Kết quả phỏng vấn',
        };
        setDetail(mapped);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.interviewId, params?.questionId]);
  
  // Xử lý khi người dùng nhấn nút lưu
  const handleSave = () => {
    // Ở đây sẽ là code để lưu trữ câu trả lời
    // Sau khi lưu thành công, hiển thị popup
    setShowSavePopup(true);
  };

  return (
    <BackgroundContainer withOverlay={false}>
      <SafeAreaView style={{ flex: 0 }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={30} color={theme.colors.white} />
        </TouchableOpacity>

        <Text
          numberOfLines={1}
          style={[styles.headerTitle, { color: theme.colors.white }]}
        >
          {detail?.interviewTitle || 'Kết quả phỏng vấn'}
        </Text>

        <TouchableOpacity style={styles.headerBtn}>
          <MaterialCommunityIcons name="share-variant" size={22} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card điểm số */}
        <View style={styles.scoreCardContainer} >
          <Text style={styles.bigScore}>{(detail?.score ?? 0).toFixed(1)}</Text>
          <Text style={styles.scoreLabel}>Điểm trung bình</Text>

          <View style={styles.scoreBreakdown}>
            <View style={styles.scoreBreakdownItem}>
              <Text style={styles.breakdownScore}>{(detail?.overallScore.speaking ?? 0).toFixed(1)}</Text>
              <Text style={styles.breakdownLabel}>Kỹ năng nói</Text>
            </View>
            <View style={styles.scoreBreakdownItem}>
              <Text style={styles.breakdownScore}>{(detail?.overallScore.content ?? 0).toFixed(1)}</Text>
              <Text style={styles.breakdownLabel}>Nội dung</Text>
            </View>
            <View style={styles.scoreBreakdownItem}>
              <Text style={styles.breakdownScore}>{(detail?.overallScore.relevance ?? 0).toFixed(1)}</Text>
              <Text style={styles.breakdownLabel}>Sự liên quan</Text>
            </View>
          </View>
        </View>

        {/* Câu hỏi */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Câu hỏi 1</Text>
            <TouchableOpacity style={styles.audioButton}>
              <MaterialCommunityIcons name="volume-high" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.questionText}>
            {detail?.question || ''}
          </Text>
        </View>

        {/* Câu trả lời */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Hiện thị văn bản câu trả lời</Text>
            <TouchableOpacity style={styles.audioButton}>
              <MaterialCommunityIcons name="volume-high" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.answerText}>
            {detail?.answer || ''}
          </Text>
        </View>

        {/* Phản hồi từ AI */}
        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackHeader}>
            <MaterialCommunityIcons 
              name="robot" 
              size={20} 
              color="#4DE9B1" 
              style={{ marginRight: 8 }} 
            />
            <Text style={styles.feedbackTitle}>Phản hồi từ AI</Text>
          </View>
          
          <View style={styles.strengthsContainer}>
            <Text style={styles.strengthsTitle}>Điểm mạnh</Text>
            {(detail?.strengths || []).map((item, index) => (
              <View key={`strength-${index}`} style={styles.feedbackItem}>
                <View style={styles.bulletPoint}>
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={16} 
                    color="#4DE9B1" 
                  />
                </View>
                <Text style={styles.feedbackItemText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.improvementsContainer}>
            <Text style={styles.improvementsTitle}>Những điểm cần cải thiện</Text>
            {(detail?.improvements || []).map((item, index) => (
              <View key={`improvement-${index}`} style={styles.feedbackItem}>
                <View style={styles.bulletPoint}>
                  <MaterialCommunityIcons 
                    name="alert-circle" 
                    size={16} 
                    color="#FF7979" 
                  />
                </View>
                <Text style={styles.feedbackItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Nút lưu */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <MaterialCommunityIcons name="content-save-outline" size={22} color="#00141A" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      {/* Popup thông báo lưu thành công */}
      <InfoPopup
        visible={showSavePopup}
        title="Lưu thành công!"
        message="Câu trả lời này đã được lưu vào danh sách câu trả lời đã lưu của bạn."
        buttonText="Đóng"
        onClose={() => setShowSavePopup(false)}
        type="success"
      />
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 10,
    
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    // backgroundColor: 'rgba(217, 217, 217, 0.15)',
    // borderBottomLeftRadius: 12,
    // borderBottomRightRadius: 12,
    marginBottom: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  // Score Card
  scoreCardContainer: {
    marginHorizontal: 0,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.2)'
  },
  bigScore: {
    fontSize: 56,
    fontWeight: '800',
    color: '#2CE59A',
    textAlign: 'center',
    lineHeight: 60,
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 16,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  scoreBreakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  
  // Question & Answer Cards
  card: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '600',
  },
  audioButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  answerText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  
  // AI Feedback
  feedbackContainer: {
    marginBottom: 20,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackTitle: {
    color: '#4DE9B1',
    fontSize: 16,
    fontWeight: '700',
  },
  strengthsContainer: {
    marginBottom: 16,
  },
  strengthsTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  improvementsContainer: {
    marginBottom: 20,
  },
  improvementsTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  feedbackItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 8,
  },
  bulletPoint: {
    width: 20,
    alignItems: 'center',
    marginRight: 8,
  },
  feedbackItemText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  
  // Footer Button
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 70, // Vị trí cao hơn để không bị tab bar che
    paddingHorizontal: 20,
  },
  saveButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#4DE9B1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4DE9B1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  saveButtonText: {
    color: '#00141A', // Using dark text color on light button background
    fontSize: 16,
    fontWeight: '700',
  },
});

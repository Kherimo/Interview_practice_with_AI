import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../../context/ThemeContext'; 
import BackgroundContainer from '../../../../components/common/BackgroundContainer';
import InfoPopup from '../../../../components/common/InfoPopup';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getAnswerDetail, saveQuestion, removeSavedQuestion, checkQuestionSaved } from '../../../../services/interviewService';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

// Định nghĩa type cho chi tiết câu trả lời
type AnswerDetail = {
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
  audio_url?: string;
};

// Remove mock data - will use API instead

export default function HistoryAnswerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ questionId?: string, interviewId?: string }>();
  const { theme } = useTheme();
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [data, setData] = useState<AnswerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [popupMsg, setPopupMsg] = useState('');
  const [answerSound, setAnswerSound] = useState<Audio.Sound | null>(null);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  // Fetch answer detail data
  useEffect(() => {
    if (params?.questionId && params?.interviewId) {
      fetchAnswerDetail(params.interviewId, params.questionId);
    }
  }, [params?.questionId, params?.interviewId]);

  const fetchAnswerDetail = async (sessionId: string, questionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAnswerDetail(sessionId, questionId);
      setData(response.answer);
      const savedRes = await checkQuestionSaved(questionId);
      setIsSaved(Boolean(savedRes?.saved));
    } catch (err) {
      console.error('Error fetching answer detail:', err);
      setError('Không thể tải chi tiết câu trả lời');
      Alert.alert('Lỗi', 'Không thể tải chi tiết câu trả lời. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      Speech.stop();
      setIsSpeakingQuestion(false);
      if (answerSound) {
        answerSound.unloadAsync();
      }
    };
  }, [answerSound]);

  // Show loading state
  if (loading) {
    return (
      <BackgroundContainer withOverlay={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4DE9B1" />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Đang tải chi tiết câu trả lời...
          </Text>
        </View>
      </BackgroundContainer>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <BackgroundContainer withOverlay={false}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            {error || 'Không tìm thấy thông tin câu trả lời'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => params?.interviewId && params?.questionId && 
              fetchAnswerDetail(params.interviewId, params.questionId)}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </BackgroundContainer>
    );
  }
  
  // Xử lý khi người dùng nhấn nút lưu
  const handleSave = async () => {
    try {
      if (!params?.questionId) return;
      if (isSaved) {
        await removeSavedQuestion(String(params.questionId));
        setIsSaved(false);
        setPopupMsg('Đã xóa câu hỏi khỏi danh sách lưu');
      } else {
        await saveQuestion(String(params.questionId));
        setIsSaved(true);
        setPopupMsg('Câu hỏi đã được lưu');
      }
      setShowSavePopup(true);
    } catch (e) {
      // ignore
    }
  };

  const handleSpeakQuestion = () => {
    if (!data?.question) return;
    if (isSpeakingQuestion) {
      Speech.stop();
      setIsSpeakingQuestion(false);
      return;
    }
    Speech.stop();
    if (answerSound) {
      answerSound.stopAsync();
    }
    Speech.speak(data.question, {
      language: 'vi-VN',
      onStart: () => setIsSpeakingQuestion(true),
      onDone: () => setIsSpeakingQuestion(false),
      onStopped: () => setIsSpeakingQuestion(false),
      onError: () => setIsSpeakingQuestion(false),
    });
  };

  const handlePlayAnswerAudio = async () => {
    try {
      if (!data?.audio_url) return;
      Speech.stop();
      setIsSpeakingQuestion(false);
      if (answerSound) {
        const status = await answerSound.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await answerSound.stopAsync();
            return;
          }
          await answerSound.replayAsync();
          return;
        }
      }
      const { sound } = await Audio.Sound.createAsync({ uri: data.audio_url });
      setAnswerSound(sound);
      await sound.playAsync();
    } catch (e) {
      console.error('Play answer audio failed', e);
    }
  };

  return (
    <BackgroundContainer withOverlay={false}>
      <SafeAreaView style={{ flex: 0 }} />
      
      {/* Header */}
      <View style={ styles.header}>
        <TouchableOpacity onPress={() => {router.back()}}>
            <IconSymbol name='chevron.left' size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <Text
        numberOfLines={1}
        style={[styles.headerTitle]}
        >
          {data.interviewTitle}
        </Text>
        
        <TouchableOpacity style={styles.headerBtn} onPress={() => { /* share */ }}>
          <MaterialCommunityIcons name="share-variant" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card điểm số */}
        <View style={styles.scoreCardContainer} >
          <Text style={styles.bigScore}>{data.score.toFixed(1)}</Text>
          <Text style={styles.scoreLabel}>Điểm trung bình</Text>

          <View style={styles.scoreBreakdown}>
            <View style={styles.scoreBreakdownItem}>
              <Text style={styles.breakdownScore}>{data.overallScore.speaking.toFixed(1)}</Text>
              <Text style={styles.breakdownLabel}>Kỹ năng nói</Text>
            </View>
            <View style={styles.scoreBreakdownItem}>
              <Text style={styles.breakdownScore}>{data.overallScore.content.toFixed(1)}</Text>
              <Text style={styles.breakdownLabel}>Nội dung</Text>
            </View>
            <View style={styles.scoreBreakdownItem}>
              <Text style={styles.breakdownScore}>{data.overallScore.relevance.toFixed(1)}</Text>
              <Text style={styles.breakdownLabel}>Sự liên quan</Text>
            </View>
          </View>
        </View>

        {/* Câu hỏi */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Câu hỏi 1</Text>
            <TouchableOpacity style={styles.audioButton} onPress={handleSpeakQuestion}>
              <MaterialCommunityIcons name="volume-high" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.questionText}>
            {data.question}
          </Text>
        </View>

        {/* Câu trả lời */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Hiện thị văn bản câu trả lời</Text>
            <TouchableOpacity style={styles.audioButton} onPress={handlePlayAnswerAudio}>
              <MaterialCommunityIcons name="volume-high" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.answerText}>
            {data.answer}
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
            {data.strengths.map((item, index) => (
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
            {data.improvements.map((item, index) => (
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
          style={[styles.saveButton, isSaved && styles.removeButton]}
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <MaterialCommunityIcons name={isSaved ? 'delete-outline' : 'content-save-outline'} size={22} color="#00141A" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>{isSaved ? 'Xóa' : 'Lưu'}</Text>
        </TouchableOpacity>
      </View>

      {/* Popup thông báo lưu thành công */}
      <InfoPopup
        visible={showSavePopup}
        title="Thông báo"
        message={popupMsg}
        buttonText="Đóng"
        onClose={() => setShowSavePopup(false)}
        type="success"
      />
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal:10, paddingVertical:12
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
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  removeButton: {
    backgroundColor: '#FF5555',
    shadowColor: '#FF5555',
  },
  saveButtonText: {
    color: '#00141A', // Using dark text color on light button background
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4DE9B1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#00141A',
    fontSize: 16,
    fontWeight: '600',
  },
});

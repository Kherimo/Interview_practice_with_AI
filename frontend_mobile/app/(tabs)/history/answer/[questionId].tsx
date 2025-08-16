import React, { useMemo, useState } from 'react';
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
import { useTheme } from '../../../../context/ThemeContext'; 
import BackgroundContainer from '../../../../components/common/BackgroundContainer';
import InfoPopup from '../../../../components/common/InfoPopup';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
};

// Mock data cho chi tiết câu trả lời
const MOCK_ANSWERS: Record<string, AnswerDetail> = {
  'q1': {
    id: 'a1',
    questionId: 'q1',
    question: 'Điểm mạnh và điểm yếu của bạn là gì?',
    answer: 'Trong 5 năm kinh nghiệm làm việc trong lĩnh vực phát triển phần mềm, chuyên về React.js và Node.js. Trước đây tôi làm dev tại một công ty khởi nghiệp với quy mô 20 người và gần đây đã chuyển đến BigCorp, nơi tôi đã dẫn dắt một nhóm gồm 5 người trong việc phát triển một dự án cho một ngân hàng lớn. Hiệu suất dẫn đến tăng 45% tỷ lệ giữ chân khách hàng trong vòng 3 tháng đầu.',
    score: 8.2,
    overallScore: {
      speaking: 9.0,
      content: 8.5,
      relevance: 8.0
    },
    feedback: 'Phản hồi từ AI',
    strengths: [
      'Câu trả lời được trình bày rõ ràng với đủ chi tiết',
      'Thể hiện kinh nghiệm lãnh đạo',
      'Đưng điểm số và số liệu chuyên môn'
    ],
    improvements: [
      'Nên bao gồm các kỹ năng cụ thể mà những thành viên đội đã được quản lý',
      'Nên đề cập những bài học rút ra từ dự án'
    ],
    interviewId: '1',
    interviewTitle: 'Phỏng vấn IT - Senior Developer'
  },
  'q2': {
    id: 'a2',
    questionId: 'q2',
    question: 'Điểm mạnh và điểm yếu của bạn là gì?',
    answer: 'Điểm mạnh của tôi là khả năng giải quyết vấn đề và tư duy logic. Tôi có thể phân tích các vấn đề phức tạp thành các phần nhỏ hơn để giải quyết hiệu quả. Tôi cũng rất chú trọng vào chất lượng code và luôn cố gắng tuân thủ các nguyên tắc clean code. Về điểm yếu, đôi khi tôi quá chi tiết và dành nhiều thời gian cho việc hoàn thiện, điều này có thể ảnh hưởng đến tiến độ. Tôi đang cố gắng cải thiện bằng cách ưu tiên các tác vụ và quản lý thời gian tốt hơn.',
    score: 7.5,
    overallScore: {
      speaking: 8.0,
      content: 7.5,
      relevance: 7.0
    },
    feedback: 'Phản hồi từ AI',
    strengths: [
      'Nhận diện được điểm mạnh phù hợp với vị trí công việc',
      'Đã đề cập đến cách khắc phục điểm yếu',
      'Trả lời trung thực, không né tránh'
    ],
    improvements: [
      'Nên đưa ra ví dụ cụ thể cho cả điểm mạnh và điểm yếu',
      'Có thể mở rộng thêm về cách điểm mạnh đã giúp ích trong công việc trước đây',
      'Điểm yếu nên chọn vấn đề không liên quan trực tiếp đến yêu cầu chính của công việc'
    ],
    interviewId: '1',
    interviewTitle: 'Phỏng vấn IT - Senior Developer'
  },
};

export default function HistoryAnswerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ questionId?: string, interviewId?: string }>();
  const { theme } = useTheme();
  const [showSavePopup, setShowSavePopup] = useState(false);

  // Lấy data theo questionId
  const data = useMemo(() => {
    const questionId = params?.questionId || 'q1';
    const answer = MOCK_ANSWERS[questionId];
    
    // Fallback to q1 if the requested question doesn't exist
    return answer || MOCK_ANSWERS['q1'];
  }, [params?.questionId]);
  
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
            <TouchableOpacity style={styles.audioButton}>
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
            <TouchableOpacity style={styles.audioButton}>
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
  saveButtonText: {
    color: '#00141A', // Using dark text color on light button background
    fontSize: 16,
    fontWeight: '700',
  },
});

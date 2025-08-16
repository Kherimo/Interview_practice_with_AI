import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../../context/ThemeContext'; 
import BackgroundContainer from '../../../../components/common/BackgroundContainer'; 
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type QAItem = {
  id: string;
  question: string;
  score: number; // 0..10
};

type DetailData = {
  id: string;
  title: string;
  domain: string;
  averageScore: number;
  questions: number;
  duration: number;
  qa: QAItem[];
};

// Mock chi tiết – thực tế bạn lấy theo id từ params
const MOCK_DETAIL: Record<string, DetailData> = {
  '1': {
    id: '1',
    title: 'Phỏng vấn IT - Senior Developer',
    domain: 'IT',
    averageScore: 7.8,
    questions: 5,
    duration: 12,
    qa: [
      { id: 'q1', question: 'Hãy giới thiệu về bản thân và kinh nghiệm làm việc của bạn.', score: 8.5 },
      { id: 'q2', question: 'Điểm mạnh và điểm yếu của bạn là gì?', score: 7.2 },
      { id: 'q3', question: 'Tại sao bạn muốn làm việc tại công ty chúng tôi?', score: 6.8 },
      { id: 'q4', question: 'Một dự án khó nhất bạn từng tham gia và vai trò của bạn?', score: 7.9 },
      { id: 'q5', question: 'Bạn định hướng phát triển sự nghiệp như thế nào trong 2-3 năm?', score: 8.0 },
    ],
  },
};

export default function HistoryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Lấy data theo id (fallback về '1' để demo)
  const data: DetailData = useMemo(() => {
    const id = params?.id && MOCK_DETAIL[params.id] ? params.id : '1';
    return MOCK_DETAIL[id];
  }, [params?.id]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#2CE59A';      // xanh lá
    if (score >= 6) return '#2196F3';      // xanh dương
    if (score >= 4) return '#FF9800';      // cam
    return '#F44336';                       // đỏ
  };

  const renderQAItem = ({ item, index }: { item: QAItem; index: number }) => (
    <TouchableOpacity 
      style={[styles.qaItem, styles.cardBorder]}
      onPress={() => {
        router.push({
          pathname: "/(tabs)/history/answer/[questionId]",
          params: { questionId: item.id, interviewId: data.id }
        });
      }}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.qaTitle, { color: theme.colors.white }]}>
          {`Câu hỏi ${index + 1}`}
        </Text>
        <Text style={[styles.qaQuestion, { color: theme.colors.textSecondary }]}>
          {item.question}
        </Text>
      </View>
      <View style={styles.qaScoreWrap}>
        <Text style={[styles.qaScore, { backgroundColor: getScoreColor(item.score) }]}>
          {item.score.toFixed(1)}
        </Text>
      </View>
      <MaterialCommunityIcons 
        name="chevron-right" 
        size={20} 
        color={theme.colors.textSecondary}
        style={{ marginLeft: 6 }} 
      />
    </TouchableOpacity>
  );

  return (
    <BackgroundContainer withOverlay={false}>
      <SafeAreaView />
      {/* Header */}
      <View style={ styles.header}>
        <TouchableOpacity onPress={() => {router.back()}}>
            <IconSymbol name='chevron.left' size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <Text
        numberOfLines={1}
        style={[styles.headerTitle]}
        >
          {data.title}
        </Text>
        
        <TouchableOpacity style={styles.headerBtn} onPress={() => { /* share */ }}>
          <MaterialCommunityIcons name="share-variant" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {/* Card điểm + stats */}
        <View style={[styles.scoreCard, styles.cardBorder]}>
            <Text style={styles.bigScore}>{data.averageScore.toFixed(1)}</Text>
            <Text style={styles.bigScoreLabel}>Điểm trung bình</Text>

            <View style={styles.topStatsRow}>
                <View style={styles.topStat}>
                    <Text style={styles.topStatValue}>{data.questions}</Text>
                    <Text style={styles.topStatLabel}>Câu hỏi</Text>
                </View>
                <View style={styles.topStat}>
                    <Text style={styles.topStatValue}>{data.duration}</Text>
                    <Text style={styles.topStatLabel}>Phút</Text>
                </View>
                <View style={styles.topStat}>
                    <Text style={styles.topStatValue}>{data.domain}</Text>
                    <Text style={styles.topStatLabel}>Lĩnh vực</Text>
                </View>
            </View>
        </View>

      {/* Danh sách câu trả lời */}
      <Text style={[styles.sectionTitle]}>
        Danh sách câu trả lời
      </Text>

      <FlatList
        data={data.qa}
        keyExtractor={(i) => i.id}
        renderItem={renderQAItem}

        contentContainerStyle={{paddingBottom: 130 }} // Tăng padding cho danh sách để tránh bị che bởi nút và tab bar
      />
      {/* Nút tiếp tục luyện tập (fixed) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/Interview')}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryBtnText}>Tiếp tục luyện tập</Text>
        </TouchableOpacity>
      </View>
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
    color: '#FFFFFF', fontSize:18, fontWeight: 'bold',
  },

  scoreCard: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 16,
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
  bigScoreLabel: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  topStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  topStat: { flex: 1, alignItems: 'center' },
  topStatValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  topStatLabel: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '700',
    color:"#FFFFFF"
  },

  qaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cardBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  qaTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  qaQuestion: {
    fontSize: 13.5,
  },
  qaScoreWrap: {
    marginLeft: 10,
  },
  qaScore: {
    minWidth: 46,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '800',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 70, // Tăng giá trị này để nút hiển thị cao hơn trên tab bar
    paddingHorizontal: 20,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#69E6FF',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

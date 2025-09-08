import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import BackgroundContainer from '../../../components/common/BackgroundContainer';
import AppLayout from '@/components/custom/AppLayout';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatFloating from '@/components/chatFloating';
import { getInterviewHistory, getUserStats, InterviewHistoryItem, UserStats } from '@/services/interviewService';
import { useFocusEffect } from '@react-navigation/native';

// ====== Real data from API ======
type HistoryItem = InterviewHistoryItem;

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, handleTokenInvalid } = useAuth();
  const [greeting, setGreeting] = useState('Chào buổi sáng');
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [historyResponse, statsResponse] = await Promise.all([
        getInterviewHistory(),
        getUserStats()
      ]);
      setHistoryData(historyResponse.history);
      setUserStats(statsResponse.stats);
    } catch (error: any) {
      if (error?.name === 'TokenInvalid') {
        await handleTokenInvalid();
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleTokenInvalid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh data when tab is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Tính toán dữ liệu chính xác từ API
  const calculatedStats = useMemo(() => {
    if (!historyData || !userStats) {
      return {
        completedSessions: 0,
        averageScore: 0,
        totalSessions: 0,
        recentSessions: 0,
        recentAverageScore: 0,
        bestScore: 0
      };
    }

    // Tính số buổi đã hoàn thành từ history (có điểm > 0)
    const completedSessions = historyData.filter(item => item.score > 0).length;
    
    // Tính điểm trung bình từ history (chỉ những buổi có điểm)
    const sessionsWithScores = historyData.filter(item => item.score > 0);
    const totalScore = sessionsWithScores.reduce((sum, item) => sum + item.score, 0);
    const averageScore = sessionsWithScores.length > 0 ? totalScore / sessionsWithScores.length : 0;
    
    // Lấy 5 buổi gần nhất để tính điểm trung bình gần đây
    const recentSessions = Math.min(5, completedSessions);
    const recentScores = sessionsWithScores.slice(0, 5);
    const recentAverageScore = recentScores.length > 0 
      ? recentScores.reduce((sum, item) => sum + item.score, 0) / recentScores.length 
      : 0;
    
    // Điểm cao nhất
    const bestScore = sessionsWithScores.length > 0 
      ? Math.max(...sessionsWithScores.map(item => item.score))
      : 0;
    
    // Tổng số buổi từ stats
    const totalSessions = userStats.total_sessions || 0;

    return {
      completedSessions,
      averageScore,
      totalSessions,
      recentSessions,
      recentAverageScore,
      bestScore
    };
  }, [historyData, userStats]);

  const top3 = useMemo(() => historyData.slice(0, 3), [historyData]);

  const handleStartInterview = () => router.push('/interview');
  const handleViewHistory = () => router.push('/(tabs)/history');
  // const handleViewProgress = () => router.push('/(tabs)/progress');

  const getScoreColor = (score: number): string => {
    if (score >= 8) return '#2CE59A';
    if (score >= 6) return '#2196F3';
    if (score >= 4) return '#FF9800';
    return '#F44336';
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() =>
        router.push({ pathname: '/(tabs)/history/details/[id]', params: { id: item.id } })
      }
    >
      <View style={styles.historyItemContent}>
        <Text style={[styles.historyTitle, { color: theme.colors.white }]} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.historyDetails}>
          <Text style={[styles.historyDate, { color: theme.colors.textSecondary }]}>
            {item.date}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statsSubRow}>
              <MaterialCommunityIcons
                name="comment-question-outline"
                size={14}
                color={theme.colors.textSecondary}
                style={styles.itemIcon}
              />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {item.questions} câu
              </Text>
            </View>
            <View style={styles.statsSubRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color={theme.colors.textSecondary}
                style={[styles.itemIcon, styles.clockIcon]}
              />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {item.duration} phút
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.scoreContainer}>
        <Text
          style={[
            styles.historyScore,
            { backgroundColor: getScoreColor(item.score), color: '#fff' },
          ]}
        >
          {item.score.toFixed(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <BackgroundContainer>
      
        <StatusBar barStyle="light-content" />
        <ChatFloating />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Top bar brand + actions */}
          
          <View style={styles.brandRow}>
            <View>
              <Text style={styles.brand}>
                <Text style={{ color: '#7CF3FF' }}>Prep</Text>
                <Text style={{ color: '#5ee7d9' }}>Talk</Text>
              </Text>
              <Text style={{ color: '#B0BEC5' }}>Giúp bạn luyện tập phỏng vấn</Text>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.roundBtn}>
                <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.roundBtn}
                onPress={() => router.push('/(tabs)/settings')}
              >
                <MaterialCommunityIcons name="account-circle-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Greeting */}
          <Text style={styles.hello}>
            {greeting}, <Text style={{ fontWeight: '800' }}>{user?.username || 'bạn'}</Text>!
            ✌️
          </Text>

          {/* Streak card */}
          <LinearGradient
            colors={['rgba(86,0,255,0.45)', 'rgba(0,201,255,0.25)']}
            start={{ x: 0.05, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, styles.cardBorder]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={styles.streakTitle}>Chuỗi 7 ngày liên tiếp!</Text>
                <Text style={styles.streakDesc}>Bạn đang làm rất tốt! Tiếp tục phát huy nhé.</Text>
              </View>
              <MaterialCommunityIcons name="fire" size={22} color="#FFB266" />
            </View>
          </LinearGradient>

          {/* CTA card */}
          <View style={[styles.ctaCard, styles.cardBorder]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Sẵn sàng luyện tập?</Text>
              <Text style={styles.ctaDesc}>Bắt đầu buổi phỏng vấn tiếp theo</Text>
            </View>
            <TouchableOpacity onPress={handleStartInterview} activeOpacity={0.9}>
              <LinearGradient
                colors={['#7CF3FF', '#69E6FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaBtn}
              >
                <Text style={styles.ctaBtnText}>Bắt đầu phỏng vấn ›</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Robot + stats */}
          <View style={styles.robotRow}>
            <Image
              source={require('../../../assets/images/friendly_robot.png')}
              style={styles.robot}
              resizeMode="contain"
            />
            <View style={{ flex: 1, gap: 10 }}>
                             <LinearGradient
                 colors={['rgba(86,0,255,0.45)', 'rgba(0,201,255,0.25)']}
                 start={{ x: 0.05, y: 0 }}
                 end={{ x: 1, y: 1 }}
                 style={[styles.smallStat, styles.cardBorder]}
               >
                 <View style={styles.statInline}>
                   <Text style={styles.smallLabel}>Tiến trình của bạn</Text>
                   <MaterialCommunityIcons name="trending-up" size={20} color="#7CF3FF" />
                 </View>
                 <Text style={styles.smallValue}>{calculatedStats.completedSessions}</Text>
                 <Text style={styles.smallSub}>
                   {calculatedStats.totalSessions > 0 
                     ? `${calculatedStats.completedSessions}/${calculatedStats.totalSessions} buổi hoàn thành`
                     : 'Buổi luyện tập đã hoàn thành'
                   }
                 </Text>
               </LinearGradient>

               <LinearGradient
                 colors={['rgba(86,0,255,0.45)', 'rgba(0,201,255,0.25)']}
                 start={{ x: 0.05, y: 0 }}
                 end={{ x: 1, y: 1 }}
                 style={[styles.smallStat, styles.cardBorder]}
               >
                 <View style={styles.statInline}>
                   <Text style={styles.smallLabel}>Điểm trung bình</Text>
                   <MaterialCommunityIcons name="medal-outline" size={20} color="#7CF3FF" />
                 </View>
                 <Text style={styles.smallValue}>{calculatedStats.recentAverageScore > 0 ? `${calculatedStats.recentAverageScore.toFixed(1)}/10` : '0.0/10'}</Text>
                 <Text style={styles.smallSub}>
                   {calculatedStats.recentSessions > 0 
                     ? `${calculatedStats.recentSessions} buổi gần nhất` 
                     : 'Chưa có buổi luyện tập'
                   }
                   {calculatedStats.bestScore > 0 && ` • Cao nhất: ${calculatedStats.bestScore.toFixed(1)}`}
                 </Text>
               </LinearGradient>
            </View>
          </View>

          {/* History */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lịch sử</Text>
              <TouchableOpacity onPress={handleViewHistory}>
                <Text style={styles.seeAllText}>Tất cả</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7CF3FF" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
              </View>
            ) : top3.length > 0 ? (
              top3.map((item) => (
                <View key={item.id}>{renderHistoryItem({ item })}</View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có lịch sử phỏng vấn</Text>
                <Text style={styles.emptySubText}>Bắt đầu luyện tập ngay để tạo lịch sử!</Text>
              </View>
            )}
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
     
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    
  },

  // Brand row
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  brand: { fontSize: 22, fontWeight: '900' },
  roundBtn: {
    width: 42, height: 42, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },

  // Greeting
  hello: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },

  // Cards
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  cardBorder: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  streakTitle: { color: '#7CF3FF', fontWeight: '800', marginBottom: 4 },
  streakDesc: { color: 'rgba(255,255,255,0.85)' },

  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  ctaTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  ctaDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2 },
  ctaBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  ctaBtnText: { color: '#fff',fontSize: 16, fontWeight: '800' },

  // Robot + stats
  robotRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 2, marginBottom: 10 },
  robot: { width: 96, height: 150 },
  smallStat: { flex: 1, borderRadius: 16, padding: 12 },
  statInline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  smallLabel: { color: '#DFF9FF', fontWeight: '700' },
  smallValue: { color: '#FFFFFF', fontWeight: '900', fontSize: 18, marginTop: 4 },
  smallSub: { color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // Section
  sectionContainer: { marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  seeAllText: { color: '#7CF3FF',fontSize: 16, fontWeight: '500' },

  // History item (tái sử dụng style nhỏ, tương tự list)
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
  },
  historyItemContent: { flex: 1 },
  historyTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  historyDetails: { flex: 1 },
  historyDate: { fontSize: 12.5, marginBottom: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statsSubRow: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { marginRight: 4 },
  clockIcon: { marginLeft: 10 },
  statText: { fontSize: 12.5 },
  scoreContainer: { marginLeft: 12, justifyContent: 'center' },
  historyScore: {
    fontSize: 14, fontWeight: '800',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999, overflow: 'hidden', textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});

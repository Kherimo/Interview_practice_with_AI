import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import BackgroundContainer from '../../../components/common/BackgroundContainer';
import AppLayout from '@/components/custom/AppLayout';
import { SafeAreaView } from 'react-native-safe-area-context';

// ====== Mock: lịch sử gần đây (có thể thay bằng data thật) ======
type HistoryItem = {
  id: string;
  date: string;
  title: string;
  score: number;
  questions: number;
  duration: number;
};
const historyData: HistoryItem[] = [
  { id: '1', date: 'Hôm nay • 14:30', title: 'Phỏng vấn IT - Senior Developer', score: 8.2, questions: 5, duration: 12 },
  { id: '2', date: 'Hôm nay • 09:15', title: 'Phỏng vấn Marketing - Manager', score: 7.8, questions: 4, duration: 8 },
  { id: '3', date: 'Hôm qua • 16:40', title: 'Phỏng vấn Product - Associate', score: 6.5, questions: 5, duration: 10 },
  { id: '4', date: '2 ngày trước • 11:10', title: 'Phỏng vấn QA - Junior', score: 7.1, questions: 4, duration: 9 },
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Chào buổi sáng');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  const top3 = useMemo(() => historyData.slice(0, 3), []);

  const handleStartInterview = () => router.push('/Interview');
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
    <AppLayout>
      <SafeAreaView style={{ flex: 1}}  edges={['top','bottom']}>
        <StatusBar barStyle="light-content" />

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
              source={require('../../../assets/images/Robot.png')}
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
                <Text style={styles.smallValue}>12</Text>
                <Text style={styles.smallSub}>Buổi luyện tập đã hoàn thành</Text>
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
                <Text style={styles.smallValue}>8.4/10</Text>
                <Text style={styles.smallSub}>5 buổi luyện tập gần nhất</Text>
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

            {top3.map((item) => (
              <View key={item.id}>{renderHistoryItem({ item })}</View>
            ))}
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </AppLayout>
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
});

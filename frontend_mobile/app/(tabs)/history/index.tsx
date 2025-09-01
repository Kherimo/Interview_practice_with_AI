import React, { useState, useEffect } from 'react';
import { 
  View,
  Text, 
  StyleSheet, 
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useRouter } from 'expo-router';
import BackgroundContainer from '../../../components/common/BackgroundContainer';
import EmptyHistoryState from '../../../components/ui/history/EmptyHistoryState';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getInterviewHistory } from '../../../services/interviewService';

// Định nghĩa type cho lịch sử phỏng vấn
type HistoryItem = {
  id: string;
  date: string;
  title: string;
  score: number;
  questions: number;
  duration: number;
  field: string;
  position: string;
};

// Thống kê tổng quan
type Stats = {
  totalSessions: number;
  averageScore: number;
  currentWeekSessions: number;
};

export default function HistoryScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [statsData, setStatsData] = useState<Stats>({
    totalSessions: 0,
    averageScore: 0,
    currentWeekSessions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch history data
  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInterviewHistory();
      setHistoryData(response.history);
      setStatsData(response.stats);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Không thể tải lịch sử phỏng vấn');
      Alert.alert('Lỗi', 'Không thể tải lịch sử phỏng vấn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Filter history based on search query
  const filteredHistory = historyData.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if there's history data
  const hasHistory = historyData.length > 0;

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

  // Hàm xử lý khi bắt đầu phỏng vấn từ trạng thái trống
  const handleStartPractice = () => {
    router.push('/interview/interviewVoice');
  };

  // Hàm chọn màu dựa trên điểm số
  const getScoreColor = (score: number): string => {
    if (score >= 8) return '#2CE59A'; // Xanh lá
    if (score >= 6) return '#2196F3'; // Xanh dương
    if (score >= 4) return '#FF9800'; // Cam
    return '#F44336'; // Đỏ
  };
  
  return (
    <BackgroundContainer withOverlay={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical:12, paddingHorizontal:10 }}>
        <TouchableOpacity>
            <IconSymbol name='menucard.fill' size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ color: '#FFFFFF', fontSize:18, fontWeight:'bold' }}>Lịch sử phỏng vấn</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="filter-variant" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={[styles.searchContainer]}>
          <MaterialCommunityIcons name="magnify" size={22} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Tìm kiếm lịch sử phỏng vấn..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {hasHistory ? (
        <>
          {/* Thống kê tổng quan */}
          <View style={[styles.statsContainer]}>
            <Text style={[styles.statsTitle, { color: theme.colors.white }]}>Thống kê tổng quan</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#4ADEDE' }]}>{statsData.totalSessions}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Buổi luyện</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#2CE59A' }]}>{statsData.averageScore.toFixed(1)}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Điểm trung bình</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.white }]}>{statsData.currentWeekSessions}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Tuần này</Text>
              </View>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4DE9B1" />
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Đang tải lịch sử...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredHistory}
              renderItem={renderHistoryItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              refreshing={loading}
              onRefresh={fetchHistoryData}
            />
          )}
        </>
      ) : (
        <View style={styles.emptyStateContainer}>
          <EmptyHistoryState onStartPractice={handleStartPractice} />
        </View>
      )}
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 90, // Thêm padding để tránh tabBar che phủ nội dung
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 217, 217, 0.15)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin:20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 46,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: 'rgba(255,255,255,0.2)'
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingLeft: 10,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Styles cho thống kê tổng quan
  statsContainer: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  // Styles cho phần danh sách lịch sử
  listContent: {
    paddingBottom: 90,
    marginHorizontal: 20,
  },
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
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
  }
});

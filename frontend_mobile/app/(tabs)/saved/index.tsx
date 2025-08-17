import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import BackgroundContainer from '../../../components/common/BackgroundContainer';

type SavedItem = {
  id: string;
  title: string;
  category: string;     // Hành vi / Kỹ thuật / ...
  timeAgo: string;      // 2 ngày trước,...
  excerpt: string;
  score: number;        // 0..10
  bookmarked?: boolean;
};

const MOCK_SAVED: SavedItem[] = [
  {
    id: '1',
    title: 'Giới thiệu bản thân',
    category: 'Phỏng vấn hành vi',
    timeAgo: '2 ngày trước',
    excerpt:
      'Tôi có 3 năm kinh nghiệm trong phát triển web, chuyên về React và Node.js. Tôi đã tham gia nhiều dự án…',
    score: 8.5,
    bookmarked: true,
  },
  {
    id: '2',
    title: 'Điểm mạnh và điểm yếu',
    category: 'Phỏng vấn hành vi',
    timeAgo: '1 tuần trước',
    excerpt:
      'Điểm mạnh của tôi là khả năng học hỏi nhanh và làm việc nhóm tốt. Điểm yếu là đôi khi tôi quá…',
    score: 7.8,
  },
  {
    id: '3',
    title: 'Thuật toán sắp xếp',
    category: 'Phỏng vấn kỹ thuật',
    timeAgo: '2 tuần trước',
    excerpt:
      'Có nhiều thuật toán sắp xếp như Quick Sort, Merge Sort. Quick Sort có độ phức tạp O(n log n)…',
    score: 6.5,
  },
  {
    id: '4',
    title: 'Thuật toán sắp xếp',
    category: 'Phỏng vấn kỹ thuật',
    timeAgo: '2 tuần trước',
    excerpt:
      'Có nhiều thuật toán sắp xếp như Quick Sort, Merge Sort. Quick Sort có độ phức tạp O(n log n)…',
    score: 6.5,
  },
];

const FILTERS = ['Tất cả', 'Hành vi', 'Kỹ thuật'];

export default function SavedScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const list = useMemo(() => {
    if (activeFilter === 'All') return MOCK_SAVED;
    const key = activeFilter === 'Hành vi' ? 'hành vi' : 'kỹ thuật';
    return MOCK_SAVED.filter((i) => i.category.toLowerCase().includes(key));
  }, [activeFilter]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#2CE59A';
    if (score >= 6) return '#2196F3';
    if (score >= 4) return '#FF9800';
    return '#F44336';
  };

  const renderItem = ({ item }: { item: SavedItem }) => (
    <View
      style={[styles.card, styles.cardBorder]}
    >
      {/* bookmark */}
      <TouchableOpacity style={styles.bookmarkBtn} onPress={() => {}}>
        <MaterialCommunityIcons
          name={item.bookmarked ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color="#B7E9FF"
        />
      </TouchableOpacity>

      <Text style={[styles.cardTitle, { color: theme.colors.white }]} numberOfLines={1}>
        {item.title}
      </Text>

      <Text style={styles.meta} numberOfLines={1}>
        {item.category} • {item.timeAgo}
      </Text>

      <Text style={[styles.excerpt, { color: theme.colors.textSecondary }]} numberOfLines={2}>
        {item.excerpt}
      </Text>

      {/* Footer: score + actions */}
      <View style={styles.cardFooter}>
        <Text style={[styles.scoreChip, { backgroundColor: getScoreColor(item.score) }]}>
          {item.score.toFixed(1)}/10
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="play-circle-outline" size={22} color="#DFF9FF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#DFF9FF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="dots-horizontal" size={22} color="#DFF9FF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <BackgroundContainer withOverlay={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBtn} />
        <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
          Câu trả lời đã lưu
        </Text>
        <View style={styles.headerBtn} />
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

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {FILTERS.map((f) => {
          const active = activeFilter === f;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[
                styles.chip,
                active ? styles.chipActive : styles.chipInactive,
                styles.cardBorder,
              ]}
            >
              <Text style={[styles.chipText, active && { color: '#00141A' }]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 70 }}
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
    marginBottom: 8,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 46,
    borderRadius: 23,
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

  chipsRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 20 },
  chip: { height: 32, borderRadius: 16, paddingHorizontal: 14, justifyContent: 'center' },
  chipActive: { backgroundColor: '#7CF3FF' },
  chipInactive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  chipText: { color: '#DFF9FF', fontWeight: '700', fontSize: 13 },

  card: {
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.2)'
  },
  cardBorder: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },

  bookmarkBtn: { position: 'absolute', right: 10, top: 10, padding: 4 },

  cardTitle: { fontSize: 16, fontWeight: '800', marginTop: 4, marginRight: 26 },
  meta: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  excerpt: { marginTop: 8, fontSize: 13.5, lineHeight: 20 },

  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  scoreChip: {
    color: '#ffffffff',
    fontWeight: '800',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  actions: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' },
  iconBtn: { paddingHorizontal: 6, paddingVertical: 4 },
});

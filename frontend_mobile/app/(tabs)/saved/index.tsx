import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import BackgroundContainer from '../../../components/common/BackgroundContainer';
import { useFocusEffect } from '@react-navigation/native';
import { getSavedQuestions, removeSavedQuestion } from '../../../services/interviewService';
import { useRouter } from 'expo-router';

type SavedItem = {
  id: string;
  interviewId: string;
  title: string;
  category: string;
  timeAgo: string;
  excerpt: string;
  score: number;
  bookmarked?: boolean;
};

const FILTERS = ['Tất cả', 'Hành vi', 'Kỹ thuật'];

export default function SavedScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [savedData, setSavedData] = useState<SavedItem[]>([]);
  const router = useRouter();

  const formatTimeAgo = useCallback((date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  }, []);

  const loadSavedData = useCallback(async () => {
    try {
      const data = await getSavedQuestions();
      const items = (data?.saved ?? []).map((it: any) => ({
        id: String(it.id),
        interviewId: String(it.interview_id || ''),
        title: it.question,
        category: it.category,
        timeAgo: it.saved_at ? formatTimeAgo(it.saved_at) : '',
        excerpt: it.excerpt || '',
        score: it.score ?? 0,
        bookmarked: true,
      }));
      setSavedData(items);
    } catch (error) {
      console.error('Error loading saved data:', error);
      setSavedData([]);
    }
  }, [formatTimeAgo]);

  // Refresh data when tab is focused
  useFocusEffect(
    useCallback(() => {
      loadSavedData();
    }, [loadSavedData])
  );

  const list = useMemo(() => savedData, [savedData]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#2CE59A';
    if (score >= 6) return '#2196F3';
    if (score >= 4) return '#FF9800';
    return '#F44336';
  };

  const renderItem = ({ item }: { item: SavedItem }) => (
    <TouchableOpacity
      style={[styles.card, styles.cardBorder]}
      onPress={() =>
        router.push({
          pathname: '/interview/interviewResultDetails/[questionId]',
          params: { questionId: item.id, interviewId: item.interviewId },
        })
      }
    >
      {/* bookmark */}
      <TouchableOpacity
        style={styles.bookmarkBtn}
        onPress={async (e: any) => {
          e.stopPropagation?.();
          try {
            await removeSavedQuestion(item.id);
            loadSavedData();
          } catch (err) {
            console.error('Error removing saved question:', err);
          }
        }}
      >
        <MaterialCommunityIcons
          name="bookmark"
          size={20}
          color="#FFD54F"
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
    </TouchableOpacity>
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

      {/* List */}
      {list.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="bookmark-off-outline"
            size={64}
            color="#B7E9FF"
          />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Chưa có câu hỏi nào được lưu
          </Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 70 }}
        />
      )}
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
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 12, fontSize: 16 },
});
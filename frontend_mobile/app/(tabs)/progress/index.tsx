import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
 
import { useTheme } from '../../../context/ThemeContext';
 
import BackgroundContainer from '../../../components/common/BackgroundContainer';
import { Dropdown } from 'react-native-element-dropdown';

const mockScores = [
  { label: 'Dec 1', value: 4.8 },
  { label: 'Dec 5', value: 5.6 },
  { label: 'Dec 10', value: 3.9 },
  { label: 'Dec 15', value: 6.7 },
  { label: 'Dec 20', value: 5.3 },
  { label: 'Dec 25', value: 6.1 },
  { label: 'Today', value: 7.6 },
];

const filter = [
    { label: '1 ngày', value: '1' },
    { label: '7 ngày', value: '2' },
    { label: '30 ngày', value: '3' },
  ];

const domains = [
  { name: 'Software Engineering', score: 8.7 },
  { name: 'Product Management', score: 7.2 },
];

export default function ProgressScreen() {
  const { theme } = useTheme();
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false)

  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'blue' }]}>
          Dropdown label
        </Text>
      );
    }
    return null;
  };

  const maxScore = 10;
  const stat = useMemo(
    () => ({
      total: 24,
      avg: 8.3,
      best: 9.8,
    }),
    []
  );

  return (
    <BackgroundContainer withOverlay={false}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={{ alignItems: 'center', paddingVertical:12, paddingHorizontal:10 }}>
          <Text style={{ color: '#FFFFFF', fontSize:18, fontWeight: 'bold' }}>Tiến độ của bạn</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* 3 stats */}
        <View style={styles.statRow}>
          <View style={[styles.statCard]} >
            <Text style={styles.statBig}>{stat.total}</Text>
            <Text style={styles.statLabel}>Tổng buổi luyện</Text>
          </View>

          <View
            style={[styles.statCard]}
          >
            <Text style={[styles.statBig, { color: '#2CE59A' }]}>{stat.avg.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Điểm trung bình</Text>
          </View>

          <View 
            style={[styles.statCard]}
          >
            <Text style={[styles.statBig, { color: '#9CF0FF' }]}>{stat.best.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Điểm cao nhất</Text>
          </View>
        </View>

        {/* Xu hướng điểm số */}
        <View
          style={[styles.block]}
        >
          <View style={styles.blockHeader}>
            <Text style={styles.blockTitle}>Xu hướng điểm số</Text>
            <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: '#4ADEDE' }]}
            containerStyle={styles.dropdownContainer}
            itemContainerStyle={styles.itemContainerStyle}
            activeColor="rgba(74, 222, 222, 0.27)" // màu highlight trong suốt
            itemTextStyle={{ color: '#FFFFFF' }}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={filter}
            maxHeight={250}
            labelField="label"
            valueField="value"
            placeholder="Chọn khoảng thời gian"
            search={false} // bỏ search nếu không cần
            value={value}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={(item) => {
              setValue(item.value);
              setIsFocus(false);
            }}
          />
          </View>

          {/* trục & cột */}
          <View style={styles.chartArea}>
            {/* trục Y đơn giản */}
            <View style={styles.yAxis}>
              {[10, 8, 6, 4, 2, 0].map((t) => (
                <Text key={t} style={styles.yTick}>{t}</Text>
              ))}
            </View>

            {/* cột */}
            <View style={styles.bars}>
              {mockScores.map((d, idx) => {
                const hPct = (d.value / maxScore) * 100;
                return (
                  <View key={idx} style={styles.barWrap}>
                    <View style={[styles.bar, { height: `${hPct}%` }]} />
                    <Text numberOfLines={1} style={styles.barLabel}>
                      {d.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Kết quả theo từng lĩnh vực */}
        <View style={[styles.block]}>
          <Text style={styles.blockTitle}>Kết quả theo từng lĩnh vực</Text>

          {domains.map((d) => {
            // Calculate width as percentage and cast to valid DimensionValue type
            const widthPct = `${(d.score / 10) * 100}%` as any;
            return (
              <View key={d.name} style={styles.domainRow}>
                <Text style={styles.domainName}>{d.name}</Text>
                <View style={styles.domainRight}>
                  <Text style={styles.domainScore}>{d.score.toFixed(1)}</Text>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFg, { width: widthPct }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: 'rgba(217, 217, 217, 0.15)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },

  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    flexDirection: 'column',
    height: 82,
    borderRadius: 14,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
  },
  // cardBorder: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  statBig: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5 },

  block: {
    marginBottom: 20,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
  },
  blockHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  blockTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginBottom: 8 },

  dropdown: {
    height: 40,
    minWidth: 120,
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dropdownContainer: {
    borderRadius: 8,
    // paddingVertical: 6,
    backgroundColor: '#141457dc', // nền tối đồng bộ app
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  itemContainerStyle: {
    backgroundColor: 'transparent',
    // paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  placeholderStyle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  selectedTextStyle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ADEDE',
  },
  label: {
      position: 'absolute',
      backgroundColor: 'rgba(217, 217, 217, 0.15)',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
  iconStyle: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  inputSearchStyle: {
    height: 38,
    fontSize: 14,
    color: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  fieldLabel: {
    fontSize: 18,
    fontWeight: 'medium',
    marginBottom: 8,
    color: '#FFFFFF',
    
  },

  rangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  rangeBtnText: { color: '#DFF9FF', fontSize: 12.5, marginRight: 2 },

  chartArea: { flexDirection: 'row', height: 180, marginTop: 4 },
  yAxis: { width: 26, justifyContent: 'space-between', paddingVertical: 2 },
  yTick: { color: 'rgba(255,255,255,0.85)', fontSize: 10, textAlign: 'right' },

  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingLeft: 8, paddingRight: 6 },
  barWrap: { width: 28, alignItems: 'center' },
  bar: {
    width: 22,
    borderRadius: 8,
    backgroundColor: '#2CE59A',
  },
  barLabel: { color: 'rgba(223,249,255,0.95)', fontSize: 10, marginTop: 6, textAlign: 'center' },

  domainRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  domainName: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  domainRight: { width: 150, flexDirection: 'row', alignItems: 'center', gap: 8 },
  domainScore: { color: '#2CE59A', fontWeight: '700' },
  progressBg: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressFg: { height: '100%', borderRadius: 999, backgroundColor: '#2CE59A' },

});

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinish: () => void;
}

const pages = [
  {
    key: '1',
    title: 'Luyện tập với AI',
    subtitle: 'Cá nhân hóa câu hỏi phỏng vấn theo ngành nghề và mức độ kinh nghiệm.',
    image: require('../../assets/images/Onboarding1.png'),
  },
  {
    key: '2',
    title: 'Phản hồi tức thì',
    subtitle: 'Phân tích cụ thể và chấm điểm từng câu trả lời giúp bạn nâng cao kỹ năng phỏng vấn.',
    image: require('../../assets/images/Onboarding2.png'),
  },
  {
    key: '3',
    title: 'Theo dõi tiến trình của bạn',
    subtitle: "Quan sát sự cải thiện theo thời gian và thấy điểm số tăng lên sau mỗi buổi luyện tập.",
    image: require('../../assets/images/Onboarding3.png'),
  },
];

const OnboardingScreen = ({ onFinish }: OnboardingScreenProps) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < pages.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish();
    }
  };

  const onViewableItemsChanged = React.useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  });

  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

  const renderItem = ({ item }: { item: typeof pages[0] }) => (
    <View style={styles.page}>
        <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pages}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={flatListRef}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewConfigRef.current}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {pages.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex ? styles.dotActive : undefined]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === pages.length - 1 ? 'Bắt đầu' : 'Tiếp tục'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  image: {
    backgroundColor:"gba(217,217,217,0.3)",
    resizeMode: 'contain',
    maxHeight:200,
    maxWidth: 200,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop:48,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    lineHeight:27,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#999',
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: '#4ADEDE',
  },
  button: {
    backgroundColor: '#4ADEDE',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

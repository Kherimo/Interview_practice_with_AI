import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Feather from '@expo/vector-icons/Feather';
import AppLayout from '@/components/custom/AppLayout'
import ButtonCustom from '@/components/custom/ButtonCustom';
import { IconSymbol } from '@/components/ui/IconSymbol';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const InterviewModeScreen = () => {
    const handleStartPractice = () => {
        router.push({
            pathname:'/Interview/SetUpInfor',
            params: { mode: 'practice' }
        });
    };
    const handleStartInterview = () => {
        router.push({
            pathname:'/Interview/SetUpInfor',
            params: { mode: 'interview' }
        });
    };
  return (
    <AppLayout>
        <SafeAreaView style={{flex:1}}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical:12, paddingHorizontal:10 }}>
                <TouchableOpacity onPress={() => {router.back()}}>
                    <IconSymbol name='chevron.left' size={30} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={{ color: '#FFFFFF', fontSize:18, fontWeight: 'bold' }}>Chế độ phỏng vấn</Text>
                <MaterialCommunityIcons name="information-outline" size={24} color="#FFFFFF" />
            </View>
            <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Chọn chế độ luyện tập</Text>
            <View style={styles.PracticeCard}>
                <View >
                    <MaterialCommunityIcons name="wechat" style={styles.PracticeCardImage} size={52} color="#FFFFFF" />
                </View>
                <Text style={styles.PracticeCardTitle}>Chat với AI</Text>
                <Text style={styles.PracticeCardDescription}>Luyện tập với các câu hỏi cơ bản, nhận phản hồi chi tiết và cải thiện từng kỹ năng một cách có hệ thống.</Text>
                <View style={styles.featuresGrid}>
                    <View style={styles.featureRow}>
                        <Feather name="check-circle" size={18} color="#2CE59A" />
                        <Text style={{  color:'#c8c8caff', marginLeft: 5 }}>Phản hồi chi tiết</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Feather name="check-circle" size={18} color="#2CE59A" />
                        <Text style={{  color:'#c8c8caff', marginLeft: 5 }}>Không giới hạn thời gian</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Feather name="check-circle" size={18} color="#2CE59A" />
                        <Text style={{  color:'#c8c8caff', marginLeft: 5 }}>Luyện theo chủ đề</Text>
                    </View>
                </View>
                <ButtonCustom title='Bắt đầu luyện tập' onPress={handleStartPractice} buttonStyle={styles.buttonStyle} textStyle={styles.buttontextStyle} />
            </View>
            <View style={styles.PracticeCard}>
                <View>
                    <MaterialCommunityIcons name="robot-happy-outline" style={styles.PracticeCardImage} size={53} color="#FFFFFF" />
                </View>
                <Text style={styles.PracticeCardTitle}>Phỏng vấn với AI</Text>
                <Text style={styles.PracticeCardDescription}>Trải nghiệm phỏng vấn thực tế với AI thông minh và câu hỏi linh hoạt.</Text>
                <View style={styles.featuresGrid}>
                    <View style={styles.featureRow}>
                        <Feather name="check-circle" size={18} color="#2CE59A" />
                        <Text style={{  color:'#c8c8caff', marginLeft: 5 }}>Phỏng vấn thời gian thực</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Feather name="check-circle" size={18} color="#2CE59A" />
                        <Text style={{  color:'#c8c8caff', marginLeft: 5 }}>Câu hỏi linh hoạt</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <Feather name="check-circle" size={18} color="#2CE59A" />
                        <Text style={{  color:'#c8c8caff', marginLeft: 5 }}>Đánh giá tổng thể</Text>
                    </View>
                </View>
                <ButtonCustom title='Thử thách bản thân' onPress={handleStartInterview} buttonStyle={styles.buttonStyle} textStyle={styles.buttontextStyle} />
            </View>
            </ScrollView>
        </SafeAreaView>
    </AppLayout>
  )
}

export default InterviewModeScreen

const styles = StyleSheet.create({
    scrollView: { padding: 20, flexGrow: 1},
    title: {fontSize: 28, color:'#FFFFFF', fontWeight: 'bold', marginBottom: 20, textAlign: 'center'},
    PracticeCard:{borderWidth: 1, borderColor: '#4ADEDE', borderRadius: 10, padding: 25, marginBottom: 20, backgroundColor: '#rgba(217, 217, 217, 0.15)', flexDirection: 'column', alignItems: 'center', justifyContent:'center'},
    PracticeCardImage:{borderRadius: 100, marginBottom: 10, backgroundColor: '#4ADEDE', padding: 15, alignItems: 'center', justifyContent: 'center'},
    PracticeCardTitle:{fontSize: 24, color: '#FFFFFF', fontWeight: 'bold'},
    PracticeCardDescription:{fontSize: 18, color: '#d7d7d8ff', textAlign: 'center', marginVertical:10},
    featuresGrid:{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent:'center', marginTop: 10},
    featureRow:{flexDirection: 'row', justifyContent:'space-between', alignItems: 'center',  marginHorizontal:2, marginVertical:5 },
    buttonStyle:{marginTop: 15, width: '100%', backgroundColor: '#4ADEDE', borderRadius: 16, paddingVertical: 15, paddingHorizontal: 20, alignItems: 'center'},
    buttontextStyle:{fontSize: 18, color: '#FFFFFF', fontWeight: 'bold'},
})
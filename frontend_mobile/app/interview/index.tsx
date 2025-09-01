import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import AppLayout from '@/components/custom/AppLayout'
import { IconSymbol } from '@/components/ui/IconSymbol'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Dropdown } from 'react-native-element-dropdown'
import { drop } from 'lodash'
import ButtonCustom from '@/components/custom/ButtonCustom'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { startInterview } from '@/services/interviewService'
const FIELDS = [
  { label: 'IT', value: 'IT' },
  { label: 'Kinh doanh', value: 'Business' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Tài chính', value: 'Finance' },
  { label: 'Nhân sự', value: 'HR' },
];

const SPECIALIZATIONS_MAP: Record<string, { label: string; value: string }[]> = {
  IT: [
    { label: 'Frontend', value: 'Frontend' },
    { label: 'Backend', value: 'Backend' },
    { label: 'Mobile', value: 'Mobile' },
    { label: 'Data/AI', value: 'Data' },
    { label: 'QA/Tester', value: 'QA' },
    { label: 'DevOps', value: 'DevOps' },
    { label: 'Product', value: 'Product' },
  ],
  Business: [
    { label: 'Business Analyst', value: 'Business Analyst' },
    { label: 'Sales', value: 'Sales' },
    { label: 'Operations', value: 'Operations' },
    { label: 'Project Management', value: 'Project Management' },
  ],
  Marketing: [
    { label: 'Digital Marketing', value: 'Digital Marketing' },
    { label: 'Content', value: 'Content' },
    { label: 'Performance', value: 'Performance' },
    { label: 'SEO', value: 'SEO' },
  ],
  Finance: [
    { label: 'Accounting', value: 'Accounting' },
    { label: 'Auditing', value: 'Auditing' },
    { label: 'Investment', value: 'Investment' },
    { label: 'Financial Analysis', value: 'Financial Analysis' },
  ],
  HR: [
    { label: 'Recruitment', value: 'Recruitment' },
    { label: 'C&B', value: 'C&B' },
    { label: 'HRBP', value: 'HRBP' },
    { label: 'Training', value: 'Training' },
  ],
};

const EXPERIENCES = [
  { label: 'Fresher (0-1 năm)', value: 'fresher' },
  { label: 'Junior (1-3 năm)', value: 'junior' },
  { label: 'Middle (3-5 năm)', value: 'middle' },
  { label: 'Senior (5+ năm)', value: 'senior' },
];



const SetUpInfor = () => {
    const [field, setField] = useState<string | null>(FIELDS[0].value);
    const [specialization, setSpecialization] = useState<string | null>(SPECIALIZATIONS_MAP[FIELDS[0].value][0].value);
    const [experience, setExperience] = useState<string | null>(EXPERIENCES[1].value);
    const [isFocus, setIsFocus] = useState(false);
    const [time, setTime] = useState("30");
    const [questions, setQuestions] = useState("8");
    const { mode } = useLocalSearchParams();
    const renderLabel = () => null;
    const handleStartInterview = async () => {
      try {
        const payload = {
          field: field || 'IT',
          specialization: specialization || 'General',
          experience_level: experience || 'junior',
          time_limit: Number(time || '30'),
          question_limit: Number(questions || '5'),
          mode: (mode as string) || 'voice',
          difficulty_setting: 'medium',
        };
        const res = await startInterview(payload as any);
        const sessionId = res?.session_id || res?.id;
        const totalQuestions = res?.total_questions || payload.question_limit;
        if (!sessionId) {
          throw new Error('Không tạo được phiên phỏng vấn');
        }
        router.push({
          pathname: '/interview/interviewVoice',
          params: { time, qTotal: String(totalQuestions), sessionId: String(sessionId), specialty: specialization || field || 'IT' }
        });
      } catch (e: any) {
        console.error('Start interview failed', e?.message || e);
      }
    };
  return (
    <AppLayout>
        <SafeAreaView style={{flex:1}}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal:10, paddingVertical:12 }}>
                <TouchableOpacity onPress={() => {router.back()}}>
                    <IconSymbol name='chevron.left' size={30} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={{ color: '#FFFFFF', fontSize:18, fontWeight: 'bold' }}>Thiết lập thông tin</Text>
                <MaterialCommunityIcons name="information-outline" size={24} color="#FFFFFF" />
            </View>
          <ScrollView style={{padding:20}} showsVerticalScrollIndicator={false}>
            <Text style={styles.headerText}>Hãy thiết lập thông tin của bạn trước khi bắt đầu luyện phỏng vấn!</Text>
            <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Chọn lĩnh vực của bạn</Text>
                <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                itemContainerStyle={styles.itemContainerStyle}
                
                activeColor='#4ADEDE'
                itemTextStyle={{ color: '#ffffffff' }}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={FIELDS}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={FIELDS[0].label}
                searchPlaceholder="Tìm kiếm..."
                            value={field}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    setField(item.value);
                    // Reset specialization to first of selected field
                    const specs = SPECIALIZATIONS_MAP[item.value] || [];
                    setSpecialization(specs.length ? specs[0].value : null);
                    setIsFocus(false);
                    }}
                />
            </View>
            <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Chọn chuyên môn của bạn</Text>
                <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                itemContainerStyle={styles.itemContainerStyle}
                
                activeColor='#4ADEDE'
                itemTextStyle={{ color: '#ffffffff' }}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={SPECIALIZATIONS_MAP[field || 'IT']}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={(SPECIALIZATIONS_MAP[field || 'IT'][0] || { label: 'Chọn chuyên môn' }).label}
                searchPlaceholder="Tìm kiếm..."
                            value={specialization}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    setSpecialization(item.value);
                    setIsFocus(false);
                    }}
                />
            </View>
            <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Kinh nghiệm làm việc</Text>
                <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                itemContainerStyle={styles.itemContainerStyle}
                
                activeColor='#4ADEDE'
                itemTextStyle={{ color: '#ffffffff' }}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={EXPERIENCES}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={EXPERIENCES[1].label}
                searchPlaceholder="Tìm kiếm..."
                searchPlaceholderTextColor='#000'
                            value={experience}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    setExperience(item.value);
                    setIsFocus(false);
                    }}
                />
            </View>
            <View style={styles.fieldInterview}>
                <View style={styles.settingInterview}>
                    <Text style={styles.fieldLabel}>Thời gian</Text>
                    <View style={styles.item}>
                        <TextInput
                        value={time}
                        onChangeText={setTime}
                        keyboardType="numeric"
                        style={styles.valueInput}
                        />
                        <Text style={styles.unit}>Phút</Text>
                    </View>
                </View>
                <View style={styles.settingInterview}>
                    <Text style={styles.fieldLabel}>Câu hỏi</Text>
                    <View style={styles.item}>
                        <TextInput
                        value={questions}
                        keyboardType='numeric'
                        onChangeText={setQuestions}
                        style={styles.valueInput}
                        />
                        <Text style={styles.unit}>Câu hỏi</Text>
                    </View>
                </View>
            </View>
            <ButtonCustom onPress={handleStartInterview} title="Bắt đầu phỏng vấn" buttonStyle={styles.buttonStyle} textStyle={styles.buttontextStyle} />
          </ScrollView>
        </SafeAreaView>
    </AppLayout>
  )
}

export default SetUpInfor

const styles = StyleSheet.create({
    headerText:{color: '#FFFFFF', fontSize: 20, marginBottom: 20, textAlign: 'center'},
    fieldCard: {
       marginBottom: 10,
       marginTop: 10,
    },
    dropdown: {
      height: 45,
      borderColor: 'gray',
      backgroundColor: 'rgba(217, 217, 217, 0.15)',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
    },
    dropdownContainer: {
      borderRadius:0,
      borderWidth: 0,
      padding: 0,
      backgroundColor: '#313674d5',
    },
    itemContainerStyle: {
      backgroundColor: 'transparent',
        borderBottomWidth: 0.5,
        borderColor: 'rgba(217,217,217,0.8)',
    },
    icon: {
      marginRight: 5,
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
    placeholderStyle: {
      fontSize: 16,
      color:"#e6e6e6ff",
    },
    selectedTextStyle: {
      fontSize: 16,
      color:"#4ADEDE",
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
      color: '#FFFFFF',
    
    },
    fieldLabel: {
      fontSize: 18,
      fontWeight: 'medium',
      marginBottom: 8,
      color: '#FFFFFF',
      
    },
    fieldInterview: {flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderRadius: 16, marginBottom: 20},
    valueInput:{color: '#4ADEDE', fontSize: 20, width:'100%', maxWidth:40, fontWeight: 'bold', textAlign: 'center'},
    item: {alignItems: "center",flexDirection:'row',justifyContent:'flex-start',padding: 10, borderRadius:8, backgroundColor: 'rgba(217, 217, 217, 0.15)', width:'100%'},
    unit: {fontSize: 14, color: "#4ADEDE",},
    settingInterview:{flexDirection:'column', alignItems:'flex-start',justifyContent:'center', borderRadius: 16, marginBottom: 20, width:'35%'},
    buttonStyle:{marginTop: 15, width: '100%', backgroundColor: '#4ADEDE', borderRadius: 16, paddingVertical: 15, paddingHorizontal: 20, alignItems: 'center'},
    buttontextStyle:{fontSize: 18, color: '#FFFFFF', fontWeight: 'bold'},
})
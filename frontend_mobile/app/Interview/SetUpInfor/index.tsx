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
const data = [
    { label: 'Item 1', value: '1' },
    { label: 'Item 2', value: '2' },
    { label: 'Item 3', value: '3' },
    { label: 'Item 4', value: '4' },
    { label: 'Item 5', value: '5' },
    { label: 'Item 6', value: '6' },
    { label: 'Item 7', value: '7' },
    { label: 'Item 8', value: '8' },
  ];



const SetUpInfor = () => {
    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [time, setTime] = useState("30");
    const [questions, setQuestions] = useState("8");
    const { mode } = useLocalSearchParams();
    const handleStartInterviews = () => {
        if (mode === 'interview') {
            router.push('/Interview/InterviewVoice');
        }else if (mode === 'practice') {
            router.push('/Interview/InterviewChat');

        }
    };
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
                data={data}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="IT"
                searchPlaceholder="Tìm kiếm..."
                            value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    setValue(item.value);
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
                data={data}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="IT"
                searchPlaceholder="Tìm kiếm..."
                            value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    setValue(item.value);
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
                data={data}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="IT"
                searchPlaceholder="Tìm kiếm..."
                searchPlaceholderTextColor='#000'
                            value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    setValue(item.value);
                    setIsFocus(false);
                    }}
                />
            </View>
            { mode === 'interview' && (
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
                        onChangeText={setQuestions}
                        style={styles.valueInput}
                        />
                        <Text style={styles.unit}>Câu hỏi</Text>
                    </View>
                </View>
            </View>
            )}
            <ButtonCustom onPress={handleStartInterviews} title="Bắt đầu phỏng vấn" buttonStyle={styles.buttonStyle} textStyle={styles.buttontextStyle} />
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
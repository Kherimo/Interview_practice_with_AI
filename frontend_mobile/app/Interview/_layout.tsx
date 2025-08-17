import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const InterviewLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="SetUpInfor/index" options={{ headerShown: false }} />
        <Stack.Screen name="InterviewChat/index" options={{ headerShown: false }} />
        <Stack.Screen name="InterviewVoice/index" options={{ headerShown: false }} />
    </Stack>
  )
}

export default InterviewLayout

const styles = StyleSheet.create({})
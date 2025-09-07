import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  ScrollView,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
// eslint-disable-next-line import/no-unresolved
import * as Speech from 'expo-speech';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getNextQuestion, submitAnswer, finishInterview } from '@/services/interviewService';
import BackgroundContainer from '@/components/common/BackgroundContainer';
import { useTheme } from '@/context/ThemeContext';
import InfoPopup from '@/components/common/InfoPopup';
import ConfirmPopup from '@/components/common/ConfirmPopup';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AppLayout from '@/components/custom/AppLayout';
import { SafeAreaView } from 'react-native-safe-area-context';

// (Tùy chọn tích hợp ghi âm thật): import { Audio } from 'expo-av';

type Phase = 'idle' | 'recording' | 'answered';

export default function VoiceInterviewScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { specialty, qIndex, qTotal } = useLocalSearchParams<{
    specialty?: string;
    qIndex?: string;
    qTotal?: string;
  }>();

  const title = specialty || 'Software Engineering';
  const [questionIndex, setQuestionIndex] = useState<number>(Number(qIndex || 1));
  const [questionTotal, setQuestionTotal] = useState<number>(Number(qTotal || 5));
  const { time, sessionId } = useLocalSearchParams(); 
  const interviewTime = Number(time) * 60; // chuyển phút -> giây
  const [interviewCountdown, setInterviewCountdown] = useState(interviewTime);

  const [phase, setPhase] = useState<Phase>('idle');
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | number | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [showEndPopup, setShowEndPopup] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [questionId, setQuestionId] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // audio recording/playback state
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  // Simple waveform animation (fake)
  const bars = new Array(16).fill(0);
  const anims = useRef(bars.map(() => new Animated.Value(4))).current;

  // Block hardware back during and after interview
  useEffect(() => {
    const onBack = () => true;
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

  // format mm:ss
  const mmssinterview = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
  useEffect(() => {
  if (interviewCountdown <= 0) return;

  countdownRef.current = setInterval(() => {
    setInterviewCountdown(prev => {
      if (prev <= 1) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setShowEndPopup(true); // hết giờ => popup kết thúc
        return 0;
      }
      return prev - 1;
    });
  }, 1000) as unknown as NodeJS.Timeout;

  return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
}, []);

  const finishAndShowPopup = async () => {
    try {
      if (sessionId && !isFinished) {
        await finishInterview(String(sessionId));
        setIsFinished(true);
      }
    } catch {}
    // Stop timers and TTS immediately to avoid delayed popups later
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setInterviewCountdown(0);
    Speech.stop();
    setShowEndPopup(true);
  };

  // Fetch first question
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        if (!sessionId) return;
        const res = await getNextQuestion(String(sessionId));
        if (res?.question) setQuestionText(res.question);
        if (typeof res?.question_number === 'number') setQuestionIndex(res.question_number);
        if (typeof res?.total_questions === 'number') setQuestionTotal(res.total_questions);
        if (res?.question_id) setQuestionId(res.question_id);
      } catch (e) {
        console.error('Fetch question failed', e);
      }
    };
    fetchQuestion();
  }, [sessionId]);

  // Speak question in Vietnamese whenever it changes
  useEffect(() => {
    if (questionText) {
      Speech.stop();
      Speech.speak(questionText, { language: 'vi-VN' });
    }
    return () => {
      Speech.stop();
    };
  }, [questionText]);

  // timer
  useEffect(() => {
    // Di chuyển các hàm vào bên trong useEffect
    const startWave = () => {
      anims.forEach((a, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(a, { toValue: 22 + (i % 7) * 3, duration: 300 + (i % 5) * 40, useNativeDriver: false }),
            Animated.timing(a, { toValue: 4, duration: 260 + (i % 5) * 35, useNativeDriver: false }),
          ])
        ).start();
      });
    };

    const stopWave = () => anims.forEach(a => a.stopAnimation());

    if (phase === 'recording') {
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000) as unknown as NodeJS.Timeout;
      startWave();
      // (Nếu dùng expo-av thì ở đây gọi Audio.Recording.createAsync... )
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopWave();
      // (Nếu dùng expo-av thì stopAndUnloadAsync, getURI, gửi server STT...)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, anims]);

  const mmss = useMemo(() => {
    const mm = String(Math.floor(timer / 60)).padStart(2, '0');
    const ss = String(timer % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [timer]);

  const onTapMic = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setRecordingUri(null);
      setPhase('recording');
    } catch (e) {
      console.error('Start recording failed', e);
    }
  };
  const onStop = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        setRecordingUri(uri || null);
      }
    } catch (e) {
      console.error('Stop recording failed', e);
    } finally {
      setPhase('answered');
    }
  };

  const onReplay = async () => {
    try {
      if (!recordingUri) return;
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      setSound(sound);
      await sound.playAsync();
    } catch (e) {
      console.error('Replay failed', e);
    }
  };

  const onReRecord = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
    } catch {}
    setRecordingUri(null);
    setTranscript('');
    setPhase('idle');
  };

  const onSpeakQuestion = () => {
    if (questionText) {
      Speech.stop();
      Speech.speak(questionText, { language: 'vi-VN' });
    }
  };

  const onSubmit = async () => {
    try {
      if (!sessionId || !questionId) return;
      await submitAnswer({
        sessionId: String(sessionId),
        questionId: String(questionId),
        answerText: transcript || 'Voice answer',
        audioUri: recordingUri || undefined,
      });
      if (questionIndex >= questionTotal) {
        await finishAndShowPopup();
        return;
      }
      const res = await getNextQuestion(String(sessionId));
      if (res?.question) setQuestionText(res.question);
      if (res?.question_id) setQuestionId(res.question_id);
      if (typeof res?.question_number === 'number') setQuestionIndex(res.question_number);
      if (typeof res?.total_questions === 'number') setQuestionTotal(res.total_questions);
      setTranscript('');
      setRecordingUri(null);
      setPhase('idle');
    } catch (e) {
      // Suppress errors to avoid noisy UI; show popup if at end
      if (questionIndex >= questionTotal) {
        await finishAndShowPopup();
      }
    }
  };

  const onSkip = async () => {
    try {
      if (!sessionId || !questionId) return;
      await submitAnswer({
        sessionId: String(sessionId),
        questionId: String(questionId),
        answerText: 'Bỏ qua câu hỏi không trả lời',
      });
      if (questionIndex >= questionTotal) {
        await finishAndShowPopup();
        return;
      }
      const res = await getNextQuestion(String(sessionId));
      if (res?.question) setQuestionText(res.question);
      if (res?.question_id) setQuestionId(res.question_id);
      if (typeof res?.question_number === 'number') setQuestionIndex(res.question_number);
      if (typeof res?.total_questions === 'number') setQuestionTotal(res.total_questions);
      setTranscript('');
      setRecordingUri(null);
      setPhase('idle');
    } catch (e) {
      // Suppress errors; if already at end, show popup
      if (questionIndex >= questionTotal) {
        await finishAndShowPopup();
      }
    }
  };

  return (
    <AppLayout>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.hbtn} onPress={() => { /* blocked */ }}>
          <IconSymbol name="chevron.left" size={30} color={theme.colors.white} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.white }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle}>{`Câu hỏi số ${questionIndex} trên ${questionTotal}`}</Text>
        </View>
        <TouchableOpacity style={styles.hbtn} onPress={() => setShowEndPopup(true)}>
          <MaterialCommunityIcons name="page-next-outline" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {/* Time interview */}

      <View style={{alignItems:'flex-end', backgroundColor: "transparent", marginRight:10, marginVertical:15}}>
        <Text style={{ color: "#fff", padding:10, borderRadius: 8, backgroundColor: "rgba(255, 255, 255, 0.1)", fontWeight: "bold", fontSize: 20 }}>
          {mmssinterview(interviewCountdown)}
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1}} showsVerticalScrollIndicator={false}>
        {/* Question bubble */}
        <View
          
          style={[styles.bubble]}
        >
          <View
              style={styles.aIQuestion}>
            <View style={styles.questionWrapper}>
              <View style={styles.questionBox}>
                <View style={styles.bubbleHeader}>
                  <Text style={styles.bubbleTag}>Behavioral Question</Text>
                  <View style={styles.bubbleActions}>
                    <TouchableOpacity style={styles.iconRound} onPress={onSpeakQuestion}>
                      <MaterialCommunityIcons name="volume-high" size={16} color="#00141A" />
                    </TouchableOpacity>
                    {/* <TouchableOpacity><Text style={styles.replayText}>Replay</Text></TouchableOpacity> */}
                  </View>
                </View>

                <Text style={styles.bubbleText}>{questionText}</Text>

                <View style={{ height: 10 }} />
                <View style={styles.tinyWave}>
                  {bars.map((_, i) => (
                    <View key={i} style={styles.tinyBar} />
                  ))}
                </View>
              </View>

              {/* Bubble tail */}
              <View style={styles.bubbleTail} />
            </View>

            {/* Avatar bên dưới trái */}
            <Image
              source={require('@/assets/images/friendly_robot.png')}
              style={styles.avatar}
              resizeMode="contain"
            />
          </View>

        </View>

        {/* Middle area: Mic / Recording / Answered */}
        <View style={{ alignItems: 'center', marginTop: 18 }}>
          {phase === 'idle' && (
            <>
              <TouchableOpacity style={styles.micBtn} onPress={onTapMic} activeOpacity={0.9}>
                <MaterialCommunityIcons name="microphone" size={32} color="#00141A" />
              </TouchableOpacity>
              <Text style={styles.micLabel}>Nhấn để Trả lời</Text>
              <Text style={styles.hint}>Hãy suy nghĩ câu trả lời của bạn trước tiên</Text>
            </>
          )}

          {phase === 'recording' && (
            <>
              <TouchableOpacity style={[styles.stopBtn]} onPress={onStop} activeOpacity={0.9}>
                <MaterialCommunityIcons name="stop" size={28} color="#00141A" />
              </TouchableOpacity>
              <Text style={styles.recording}>Đang ghi âm...</Text>
              <Text style={styles.timer}>{mmss}</Text>

              {/* big waveform */}
              <View style={styles.waveWrap}>
                {anims.map((a, i) => (
                  <Animated.View key={i} style={[styles.waveBar, { height: a }]} />
                ))}
              </View>
              <Text style={styles.tapStop}>Nhấn để dừng ghi âm</Text>
            </>
          )}

          {phase === 'answered' && (
            <LinearGradient
              colors={['rgba(86,0,255,0.35)', 'rgba(0,201,255,0.2)']}
              start={{ x: 0.05, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.answerCard, styles.cardBorder]}
            >
              <View style={styles.bubbleHeader}>
                <Text style={[styles.bubbleTag, { color: '#7CF3FF' }]}>Câu trả lời của bạn</Text>
                <View style={styles.bubbleActions}>
                  <TouchableOpacity style={styles.iconRound} onPress={onReplay}>
                    <MaterialCommunityIcons name="volume-high" size={16} color="#00141A" />
                  </TouchableOpacity>
                  {/* <TouchableOpacity><Text style={styles.replayText}>Phát lại</Text></TouchableOpacity> */}
                </View>
              </View>
              <Text style={styles.answerText}>{transcript || 'Đã ghi âm câu trả lời. Bạn có thể nghe lại hoặc ghi âm lại.'}</Text>
              <View style={{ flexDirection:'row', gap:12, marginTop:12 }}>
                <TouchableOpacity onPress={onReRecord} style={[styles.controlBtn, { backgroundColor:'#FF8080' }]}>
                  <Text style={styles.controlBtnText}>Ghi âm lại</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onSubmit} style={[styles.controlBtn, { backgroundColor:'#7CF3FF' }]}>
                  <Text style={styles.controlBtnText}>Gửi & Tiếp theo</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          )}
        </View>
      </ScrollView>
      {/* Bottom controls */}
      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.bottomBtn} onPress={onSkip}>
          <MaterialCommunityIcons name="skip-next-outline" size={24} color="#DFF9FF" />
          <Text style={styles.bottomTxt}>Bỏ qua</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomBtn}>
          <MaterialCommunityIcons name="pause-circle-outline" size={24} color="#DFF9FF" />
          <Text style={styles.bottomTxt}>Tạm dừng</Text>
        </TouchableOpacity>
      </View>
        {/* Popup thông báo hết thời gian phỏng vấn */}
        <InfoPopup
          visible={showEndPopup}
          title="Hoàn thành phỏng vấn"
          message="Bạn đã hoàn thành phiên phỏng vấn. Bây giờ bạn có thể xem kết quả phân tích và nhận phản hồi chi tiết."
          buttonText="Xem kết quả"
          onClose={async () => {
            setShowEndPopup(false);
            try {
              if (sessionId && !isFinished) {
                await finishInterview(String(sessionId));
                setIsFinished(true);
              }
            } catch (e) {
              // ignore
            }
            if (sessionId) {
              router.push({ pathname: '/interview/interviewResult', params: { id: String(sessionId), completed: '1' } });
            } else {
              router.push('/interview/interviewResult');
            }
          }}
          type="success"
        />

        {/* Popup xác nhận hủy phỏng vấn */}
        <ConfirmPopup
          visible={showCancelPopup}
          title="Hủy phỏng vấn"
          message="Bạn có chắc muốn hủy phiên phỏng vấn này? Dữ liệu phỏng vấn hiện tại sẽ không được lưu."
          confirmText="Hủy phỏng vấn"
          cancelText="Tiếp tục"
          onConfirm={() => {
            setShowCancelPopup(false);
            router.back();
          }}
          onCancel={() => setShowCancelPopup(false)}
          isDestructive={true}
        />
        </SafeAreaView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 217, 217, 0.15)',
  },
  hbtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  bubble: { marginHorizontal: 16, borderRadius: 16, padding: 14},
  cardBorder: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  aIQuestion: { flexDirection:"column", alignItems:"flex-start", marginBottom:15 },
  questionWrapper: { alignSelf:"flex-end", maxWidth:"85%", position:"relative" },
  questionBox: { padding:16, backgroundColor:"rgba(255,255,255,0.15)", borderTopLeftRadius:16, borderTopRightRadius:16, borderBottomRightRadius:16 },
  bubbleTail: {
  position:"absolute",
  left:0,
  bottom:-15,
  width:0,
  height:0,
  borderTopWidth:10,
  borderBottomWidth:6,
  borderRightWidth:10,
  borderStyle:"solid",
  borderTopColor:"rgba(255,255,255,0.15)",
  borderBottomColor:"transparent",
  borderRightColor:"transparent",
},
 bubbleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
 bubbleTag: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700' },
 bubbleActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
 iconRound: { width:28, height:28, borderRadius:14, backgroundColor:'#7CF3FF', alignItems:'center', justifyContent:'center' },
 bubbleText: { color:'#FFFFFF', marginTop:8, lineHeight:20 },
 tinyWave: { flexDirection:'row', gap:3, alignItems:'flex-end', height:12 },
 tinyBar: { width:3, height:8, borderRadius:2, backgroundColor:'#7CF3FF' },
 avatar: { width:80, height:120, borderRadius:26, marginTop:6 },


  micBtn: {
    width: 78, height: 78, borderRadius: 39, backgroundColor: '#7CF3FF',
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  micLabel: { color: '#DFF9FF', marginTop: 8, fontWeight: '700' },
  hint: { color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  stopBtn: {
    width: 78, height: 78, borderRadius: 39, backgroundColor: '#FF8080',
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  recording: { color: '#FF9E9E', marginTop: 8, fontWeight: '700' },
  timer: { color: '#FFFFFF', marginTop: 2, fontWeight: '800' },
  tapStop: { color: 'rgba(255,255,255,0.85)', marginTop: 6 },

  waveWrap: {
    height: 26, marginTop: 10, flexDirection: 'row', alignItems: 'flex-end',
    gap: 4, paddingHorizontal: 16,
  },
  waveBar: { width: 6, borderRadius: 3, backgroundColor: '#7CF3FF' },

  answerCard: { marginHorizontal: 16, borderRadius: 16, padding: 14 },
  answerText: { color: '#FFFFFF', marginTop: 8, lineHeight: 20 },
  controlBtn: { paddingVertical:10, paddingHorizontal:14, borderRadius:10 },
  controlBtnText: { color:'#00141A', fontWeight:'700' },

  bottomRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 14,
  },
  bottomBtn: { alignItems: 'center' },
  bottomTxt: { color: '#DFF9FF', marginTop: 4 },
});

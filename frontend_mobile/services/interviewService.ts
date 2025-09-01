// interviewService.ts
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

async function handleResponse(res: Response) {
  const rawText = await res.text();
  let data: any = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    // keep data as null if not JSON
  }
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || rawText || res.statusText;
    const error = new Error(typeof message === 'string' ? message : 'Request failed');
    
    // Kiểm tra nếu là lỗi token invalid (401)
    if (res.status === 401) {
      error.name = 'TokenInvalid';
    }
    
    throw error;
  }
  return data;
}

export type StartInterviewRequest = {
  field: string;
  specialization: string;
  experience_level: string;
  time_limit: number;
  question_limit: number;
  mode: string;
  difficulty_setting: string;
};

export async function startInterview(payload: StartInterviewRequest): Promise<any> {
  const token = await AsyncStorage.getItem('@preptalk_token');
  const res = await fetch(`${API_URL}/interviews/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getNextQuestion(sessionId: string) {
  const token = await AsyncStorage.getItem('@preptalk_token');
  const res = await fetch(`${API_URL}/interviews/${sessionId}/next-question`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

export async function submitAnswer(params: {
  sessionId: string | number;
  questionId: string | number;
  answerText?: string;
  audioUri?: string;
}) {
  const token = await AsyncStorage.getItem('@preptalk_token');
  const form = new FormData();
  form.append('question_id', String(params.questionId));
  form.append('answer', params.answerText || 'Voice answer');
  if (params.audioUri) {
    const filename = params.audioUri.split('/').pop() || `answer_${params.sessionId}_${params.questionId}.m4a`;
    const file: any = {
      uri: params.audioUri,
      name: filename,
      type: 'audio/m4a',
    };
    form.append('audio', file);
  }
  const res = await fetch(`${API_URL}/interviews/${params.sessionId}/answer`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });
  return handleResponse(res);
}

export async function finishInterview(sessionId: string | number) {
  const token = await AsyncStorage.getItem('@preptalk_token');
  const res = await fetch(`${API_URL}/interviews/${sessionId}/finish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

export async function getQuestionsAnswers(sessionId: string | number) {
  const token = await AsyncStorage.getItem('@preptalk_token');
  const res = await fetch(`${API_URL}/interviews/${sessionId}/questions-answers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

export async function getAnswerDetails(sessionId: string | number, questionId: string | number) {
  const token = await AsyncStorage.getItem('@preptalk_token');
  const res = await fetch(`${API_URL}/interviews/${sessionId}/answers/${questionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}



export const getInterviewDetail = async (sessionId: string): Promise<{
  detail: {
    id: string;
    title: string;
    domain: string;
    averageScore: number;
    questions: number;
    duration: number;
    qa: Array<{
      id: string;
      question: string;
      score: number;
    }>;
    field: string;
    position: string;
    experience_level: string;
    created_at: string;
  };
  message: string;
}> => {
  try {
    const token = await AsyncStorage.getItem('@preptalk_token');
    const response = await fetch(`${API_URL}/interviews/history/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching interview detail:', error);
    throw error;
  }
};

export const getAnswerDetail = async (sessionId: string, questionId: string): Promise<{
  answer: {
    id: string;
    questionId: string;
    question: string;
    answer: string;
    score: number;
    overallScore: {
      speaking: number;
      content: number;
      relevance: number;
    };
    feedback: string;
    strengths: string[];
    improvements: string[];
    interviewId: string;
    interviewTitle: string;
    audio_url: string;
  };
  message: string;
}> => {
  try {
    const token = await AsyncStorage.getItem('@preptalk_token');
    const response = await fetch(`${API_URL}/interviews/history/${sessionId}/answers/${questionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching answer detail:', error);
    throw error;
  }
};

export type InterviewHistoryItem = {
  id: string;
  date: string;
  title: string;
  score: number;
  questions: number;
  duration: number;
  field: string;
  position: string;
  experience_level: string;
  created_at: string;
};

export type InterviewStats = {
  totalSessions: number;
  averageScore: number;
  currentWeekSessions: number;
};

export type InterviewHistoryResponse = {
  history: InterviewHistoryItem[];
  stats: InterviewStats;
  message: string;
};

export async function getInterviewHistory(): Promise<InterviewHistoryResponse> {
  const token = await AsyncStorage.getItem('@preptalk_token');
  const res = await fetch(`${API_URL}/interviews/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(res);
}

export type UserStats = {
  total_sessions: number;
  completed_sessions: number;
  ongoing_sessions: number;
  completion_rate: number;
  total_score: number;
  average_score: number;
  field_distribution: Record<string, any>;
  recent_performance: number[];
  performance_trend: string;
};

export type StatsResponse = {
  stats: UserStats;
  message: string;
};

export async function getUserStats(): Promise<StatsResponse> {
  const token = await AsyncStorage.getItem('@preptalk_token');
  const res = await fetch(`${API_URL}/interviews/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(res);
}



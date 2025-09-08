import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string | null;
    profession?: string | null;
    experience_level?: string | null;
  };
};

export type GoogleLoginRequest = {
  email: string;
  name: string;
  provider_id: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  token: string;
  password: string;
};

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

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function register(fullName: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: fullName, email, password }),
  });
  return handleResponse(res);
}

export async function loginWithGoogle(googleData: GoogleLoginRequest): Promise<{ token: string }> {
  const res = await fetch(`${API_URL}/auth/login/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(googleData),
  });
  return handleResponse(res);
}

export async function forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse(res);
}

export async function resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse(res);
}

type UpdateProfilePayload = {
  name?: string;
  full_name?: string;
  email?: string;
  avatar_url?: string | null;
  profession?: string | null;
  experience_level?: string | null;
};

export async function updateProfile(payload: UpdateProfilePayload): Promise<{ message: string }>
{
  const token = await AsyncStorage.getItem('@preptalk_token');
  const res = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export type MeResponse = {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  profession?: string | null;
  experience_level?: string | null;
};

export async function getCurrentUser(): Promise<MeResponse> {
  const token = await AsyncStorage.getItem('@preptalk_token');
  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(res);
}

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export async function changePassword(request: ChangePasswordRequest): Promise<{ message: string }> {
  const token = await AsyncStorage.getItem('@preptalk_token');
  const res = await fetch(`${API_URL}/users/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      current_password: request.currentPassword,
      new_password: request.newPassword,
    }),
  });
  return handleResponse(res);
}
export async function uploadAvatar(uri: string): Promise<{ avatar_url: string }> {
  const token = await AsyncStorage.getItem('@preptalk_token');
  const form = new FormData();
  form.append('avatar', {
    uri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  } as any);
  const res = await fetch(`${API_URL}/users/avatar`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });
  return handleResponse(res);
}

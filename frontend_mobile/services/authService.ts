import Constants from 'expo-constants';
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

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || res.statusText);
  }
  return res.json();
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

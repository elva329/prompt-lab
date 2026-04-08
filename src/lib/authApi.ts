type AuthApiResult = {
  token?: string;
  user?: {
    id: string;
    email: string;
  };
  message?: string;
};

// Token storage utility
const TOKEN_KEY = 'auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function postAuth(path: 'login' | 'register', email: string, password: string): Promise<AuthApiResult> {
  const response = await fetch(`/api/auth/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = (await response.json()) as AuthApiResult;

  if (!response.ok) {
    throw new Error(data.message || `Failed to ${path}.`);
  }

  // Store token if present
  if (data.token) {
    setStoredToken(data.token);
  }

  return data;
}

export function registerRequest(email: string, password: string): Promise<AuthApiResult> {
  return postAuth('register', email, password);
}

export function loginRequest(email: string, password: string): Promise<AuthApiResult> {
  return postAuth('login', email, password);
}

export async function fetchUserByEmailRequest(email: string): Promise<AuthApiResult> {
  const response = await fetch(`/api/auth/user?email=${encodeURIComponent(email)}`);
  const data = (await response.json()) as AuthApiResult;

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user.');
  }

  return data;
}

// Helper to add authorization header to fetch options
export function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

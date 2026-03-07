type AuthApiResult = {
  user?: {
    id: string;
    email: string;
  };
  message?: string;
};

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

import { computed, reactive } from 'vue';

import { loginRequest, registerRequest } from '../lib/authApi';
import { MOCK_PROMPTS, type Experiment, type Prompt } from '../lib/mockData';

type AuthUser = {
  id: string;
  email: string;
};

type ToastVariant = 'success' | 'warning' | 'danger' | 'info';

type ToastState = {
  visible: boolean;
  message: string;
  variant: ToastVariant;
};

const state = reactive({
  user: null as AuthUser | null,
  prompts: [...MOCK_PROMPTS] as Prompt[],
  experiments: [] as Experiment[],
  toast: {
    visible: false,
    message: '',
    variant: 'success',
  } as ToastState,
});

let toastTimer: number | null = null;
const USER_EMAIL_KEY = 'promptlab_user_email';
const USER_ID_KEY = 'promptlab_user_id';

const savedEmail = window.localStorage.getItem(USER_EMAIL_KEY);
const savedUserId = window.localStorage.getItem(USER_ID_KEY);
if (savedEmail && savedUserId) {
  state.user = { id: savedUserId, email: savedEmail };
}

async function login(email: string, password: string): Promise<void> {
  const data = await loginRequest(email, password);

  if (!data.user?.email || !data.user.id) {
    throw new Error('Login failed.');
  }

  state.user = {
    id: data.user.id,
    email: data.user.email,
  };
  window.localStorage.setItem(USER_ID_KEY, data.user.id);
  window.localStorage.setItem(USER_EMAIL_KEY, data.user.email);
}

function logout(): void {
  state.user = null;
  window.localStorage.removeItem(USER_ID_KEY);
  window.localStorage.removeItem(USER_EMAIL_KEY);
}

async function register(email: string, password: string): Promise<void> {
  const data = await registerRequest(email, password);

  if (!data.user?.email || !data.user.id) {
    throw new Error('Registration failed.');
  }

  state.user = {
    id: data.user.id,
    email: data.user.email,
  };
  window.localStorage.setItem(USER_ID_KEY, data.user.id);
  window.localStorage.setItem(USER_EMAIL_KEY, data.user.email);
}

function addPrompt(newPromptData: Omit<Prompt, 'id' | 'createdAt'>): void {
  state.prompts = [
    ...state.prompts,
    {
      ...newPromptData,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
    },
  ];
}

function addExperiment(newExperimentData: Omit<Experiment, 'id' | 'createdAt' | 'status' | 'results'>): void {
  state.experiments = [
    ...state.experiments,
    {
      ...newExperimentData,
      id: `e-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'draft',
      results: [],
    },
  ];
}

function showToast(message: string, variant: ToastVariant = 'success'): void {
  state.toast.visible = true;
  state.toast.message = message;
  state.toast.variant = variant;

  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }

  toastTimer = window.setTimeout(() => {
    state.toast.visible = false;
  }, 3000);
}

function hideToast(): void {
  state.toast.visible = false;
}

export const appStore = {
  state,
  isAuthenticated: computed(() => Boolean(state.user)),
  login,
  register,
  logout,
  addPrompt,
  addExperiment,
  showToast,
  hideToast,
};

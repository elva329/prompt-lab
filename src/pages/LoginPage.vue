<template>
  <div class="login-wrapper d-flex align-items-center justify-content-center py-4 px-3">
    <div class="login-theme-decor" aria-hidden="true">
      <div class="login-theme-strip">
        <span>Prompt Draft</span>
        <i class="bi bi-arrow-right"></i>
        <span>Model Run</span>
        <i class="bi bi-arrow-right"></i>
        <span>Scoreboard</span>
      </div>

      <div class="login-theme-card login-theme-card-left">
        <p class="login-theme-title mb-2">Prompt Variants</p>
        <div class="login-theme-bars">
          <span style="--w: 78%"></span>
          <span style="--w: 56%"></span>
          <span style="--w: 88%"></span>
        </div>
        <p class="login-theme-note mb-0">A/B/C quality scan running</p>
      </div>

      <div class="login-theme-card login-theme-card-right">
        <p class="login-theme-title mb-2">Model Arena</p>
        <div class="login-theme-models mb-2">
          <span>GPT</span>
          <span>Claude</span>
          <span>Gemini</span>
        </div>
        <img src="/experiment-result-preview.svg" alt="" class="login-theme-preview" />
      </div>

      <div class="login-theme-chip login-theme-chip-1">
        <i class="bi bi-lightning-charge-fill"></i>
        <span>Latency 842ms</span>
      </div>
      <div class="login-theme-chip login-theme-chip-2">
        <i class="bi bi-stars"></i>
        <span>Quality +9%</span>
      </div>
      <div class="login-theme-chip login-theme-chip-3">
        <i class="bi bi-diagram-3"></i>
        <span>3-way Compare</span>
      </div>
    </div>

    <div class="card shadow-sm border-0 login-card w-100 login-surface-card mt-4">
      <div class="card-body p-4 p-md-5">
        <div class="text-center mb-4 login-head-copy">
          <div class="rounded-circle d-inline-flex align-items-center justify-content-center icon-circle mb-3 login-brand-orb">
            <i class="bi bi-grid-3x3-gap-fill"></i>
          </div>
          <h1 class="h3 fw-bold mb-2">{{ isRegisterMode ? 'Create Account' : 'Welcome Back' }}</h1>
          <p class="text-secondary mb-0">
            {{ isRegisterMode ? 'Register to start using PromptLab.' : 'Sign in to access your testing lab.' }}
          </p>
        </div>

        <div class="btn-group w-100 mb-3 login-mode-switch" role="group">
          <button class="btn login-mode-btn" :class="{ active: !isRegisterMode }" @click="isRegisterMode = false">
            Login
          </button>
          <button class="btn login-mode-btn" :class="{ active: isRegisterMode }" @click="isRegisterMode = true">
            Register
          </button>
        </div>

        <form class="vstack gap-3" @submit.prevent="handleSubmit">
          <div>
            <label class="form-label login-label">Email</label>
            <input
              v-model.trim="form.email"
              type="email"
              class="form-control login-input"
              required
              autocomplete="email"
            />
          </div>
          <div>
            <label class="form-label login-label login-password-label">
              Password
              <span
                v-if="isRegisterMode"
                class="login-tooltip-trigger ms-1"
                tabindex="0"
                role="button"
                :data-tooltip="passwordRuleHint"
                aria-label="Password rule info"
              >
                <i class="bi bi-info-circle-fill"></i>
              </span>
            </label>
            <input
              v-model="form.password"
              type="password"
              class="form-control login-input"
              required
              :minlength="isRegisterMode ? 8 : 1"
              :maxlength="isRegisterMode ? 16 : undefined"
              :autocomplete="isRegisterMode ? 'new-password' : 'current-password'"
            />
          </div>
          <div class="login-confirm-slot" :class="{ 'is-hidden': !isRegisterMode }">
            <label class="form-label login-label">Confirm Password</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              class="form-control login-input"
              :required="isRegisterMode"
              :disabled="!isRegisterMode"
              :minlength="isRegisterMode ? 8 : 1"
              :maxlength="isRegisterMode ? 16 : undefined"
              autocomplete="new-password"
            />
          </div>

          <p v-if="errorMessage" class="mb-0 login-error small">{{ errorMessage }}</p>

          <button type="submit" class="btn landing-primary-btn login-submit-btn w-100 py-2 mt-2" :disabled="isLoading">
            {{ isLoading ? 'Please wait...' : isRegisterMode ? 'Create Account' : 'Sign In to Dashboard' }}
            <i class="bi bi-arrow-right ms-2"></i>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { appStore } from '../stores/appStore';

const router = useRouter();
const isRegisterMode = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const passwordRuleHint =
  'Use 8-16 characters, with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol (no spaces).';

function isStrongPassword(password: string): boolean {
  if (password.length < 8 || password.length > 16) {
    return false;
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasNoSpaces = !/\s/.test(password);

  return hasUpper && hasLower && hasNumber && hasSymbol && hasNoSpaces;
}

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
});

function validateForm(): string | null {
  if (!form.email || !form.password) {
    return 'Email and password are required.';
  }

  if (isRegisterMode.value && !isStrongPassword(form.password)) {
    return 'Password must be 8-16 characters and include uppercase, lowercase, number, and special symbol (no spaces).';
  }

  if (isRegisterMode.value && form.password !== form.confirmPassword) {
    return 'Passwords do not match.';
  }

  return null;
}

async function handleSubmit(): Promise<void> {
  errorMessage.value = '';

  const validationError = validateForm();
  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  isLoading.value = true;

  try {
    if (isRegisterMode.value) {
      await appStore.register(form.email, form.password);
      // appStore.showToast('Account created successfully.', 'success');
    } else {
      await appStore.login(form.email, form.password);
      // appStore.showToast('Login successful.', 'success');
    }

    router.push('/dashboard');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Authentication failed.';
  } finally {
    isLoading.value = false;
  }
}
</script>

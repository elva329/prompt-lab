<template>
  <div class="login-wrapper d-flex align-items-center justify-content-center py-4 px-3">
    <button type="button" class="login-home-brand-block" @click="goHome">
      <span class="landing-brand-mark">
        <i class="bi bi-grid-3x3-gap-fill"></i>
      </span>
      <span class="text-start">
        <span class="landing-brand-kicker d-block mb-1">Experiment Workspace</span>
        <span class="landing-brand-name d-block">Prompt Lab</span>
      </span>
    </button>

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
            <label class="form-label login-label">Password</label>
            <input
              v-model="form.password"
              type="password"
              class="form-control login-input"
              required
              minlength="6"
              autocomplete="current-password"
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
              minlength="6"
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

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
});

function validateForm(): string | null {
  if (!form.email || !form.password) {
    return 'Email and password are required.';
  }

  if (isRegisterMode.value && form.password !== form.confirmPassword) {
    return 'Passwords do not match.';
  }

  return null;
}

function goHome(): void {
  router.push('/');
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
      appStore.showToast('Account created successfully.', 'success');
    } else {
      await appStore.login(form.email, form.password);
      appStore.showToast('Login successful.', 'success');
    }

    router.push('/dashboard');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Authentication failed.';
  } finally {
    isLoading.value = false;
  }
}
</script>

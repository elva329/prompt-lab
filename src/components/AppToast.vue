<template>
  <div class="position-fixed bottom-0 end-0 p-3 pt-5 toast-container-custom" style="z-index: 1080">
    <div
      v-if="toast.visible"
      class="toast show align-items-center border-0 shadow"
      :class="`text-bg-${toast.variant}`"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">{{ toast.message }}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="appStore.hideToast"></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { appStore } from '../stores/appStore';

const toast = computed(() => appStore.state.toast);
</script>

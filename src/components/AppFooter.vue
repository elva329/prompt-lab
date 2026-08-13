<template>
  <footer class="marketing-footer py-3">
    <div class="marketing-footer-inner px-3 px-md-4 px-xl-5 text-center">
      <p class="mb-0 marketing-footer-copy">{{ currentYear }} PromptLab. Created by Elva SHEN</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
/* Styles inherited from global styles.css (marketing-footer, marketing-footer-inner, marketing-footer-copy) */
</style>

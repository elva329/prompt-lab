<template>
  <div class="not-found d-flex flex-column align-items-center justify-content-center text-center px-3">
    <div class="not-found-icon mb-4">
      <i class="bi bi-beaker"></i>
    </div>
    <h1 class="display-6 fw-bold mb-3">404 - Area Not Found</h1>
    <p class="lead text-secondary mb-4 col-md-7">
      The experiment or page you are looking for has been moved, deleted, or never existed in this lab.
    </p>
    <button class="btn btn-dark px-4" @click="router.push('/')">Return to Safety</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

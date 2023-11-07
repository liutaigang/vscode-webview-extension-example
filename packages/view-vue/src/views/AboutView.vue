<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div>{{ publicPath }}</div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { WEBVIEW_PUBLIC_PATH } from '../constant';

const publicPath = inject(WEBVIEW_PUBLIC_PATH);

</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>

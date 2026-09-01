<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
</script>

<style>
/* Game is fullscreen — the page must never scroll. */
html, body {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

.v-application {
  background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
}
</style>

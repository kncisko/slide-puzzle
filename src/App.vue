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
</style>

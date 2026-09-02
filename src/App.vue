<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import { Capacitor } from '@capacitor/core'

onMounted(async () => {
  if (Capacitor.getPlatform() !== 'android') return

  // Mark <html> as android so CSS can target it exclusively.
  document.documentElement.classList.add('android')

  // Let the CSS (including env(safe-area-inset-top)) render first.
  await nextTick()
  requestAnimationFrame(() => {
    // Measure the actual rendered bottom of the app bar after CSS has applied
    // the env(safe-area-inset-top) offset. Use that to tell Vuetify where
    // v-main should start (--v-layout-top is set as an inline style by Vuetify).
    const bar = document.querySelector<HTMLElement>('.v-app-bar')
    const appEl = document.querySelector<HTMLElement>('.v-application')
    if (bar && appEl) {
      const barBottom = bar.getBoundingClientRect().bottom
      appEl.style.setProperty('--v-layout-top', `${barBottom}px`)
    }
  })
})
</script>

<style>
/* Game is fullscreen — the page must never scroll.
   Gradient lives on html/body so it covers safe areas (status bar, home
   indicator) on all screen sizes without any pixel-counting. */
html, body {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
  background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.v-application,
.v-application .v-main {
  background: transparent !important;
}

/* Android only: shift the fixed app bar below the status bar.
   env(safe-area-inset-top) equals the status bar height on Android edge-to-edge.
   The html.android selector ensures this never affects iOS. */
html.android .v-app-bar {
  top: calc(env(safe-area-inset-top) + 6px) !important;
}
</style>

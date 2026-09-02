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
  await nextTick()

  // Measure env(safe-area-inset-top) in actual pixels.
  // On Android with Capacitor 8 edge-to-edge, this equals the status bar height.
  // On iOS with contentInset:automatic it is 0, so this block is Android-only.
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;pointer-events:none;visibility:hidden;top:0;left:0;height:env(safe-area-inset-top)'
  document.documentElement.appendChild(probe)
  const sat = probe.getBoundingClientRect().height
  document.documentElement.removeChild(probe)

  // Extra nudge for the app bar only — does not affect main content position.
  document.documentElement.style.setProperty('--android-bar-extra', '6px')

  if (sat > 0) {
    // Vuetify sets --v-layout-top as an inline style on .v-application to tell
    // v-main where to start. Bump it by the status bar height so content isn't
    // hidden behind the now-shifted app bar.
    const appEl = document.querySelector<HTMLElement>('.v-application')
    if (appEl) {
      const current = parseFloat(appEl.style.getPropertyValue('--v-layout-top')) || 0
      appEl.style.setProperty('--v-layout-top', `${current + sat}px`)
    }
  }
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

/* On Android (Capacitor 8 edge-to-edge), shift the fixed app bar below the
   status bar. env(safe-area-inset-top) is 0 on iOS (contentInset:automatic
   already handles it there), so this rule is harmless cross-platform. */
.v-app-bar {
  top: calc(env(safe-area-inset-top) + var(--android-bar-extra, 0px)) !important;
}
</style>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <h1 class="text-h3 mb-4">Slide Puzzle</h1>
        <p class="text-body-1 mb-8 text-medium-emphasis">
          Pick a photo from your gallery or take one with your camera.
        </p>
        <div class="d-flex flex-column gap-4 align-center">
          <v-btn
            color="primary"
            size="x-large"
            rounded="pill"
            prepend-icon="mdi-image-multiple"
            :loading="loading"
            @click="pickSource('gallery')"
          >
            Choose from Gallery
          </v-btn>
          <v-btn
            color="secondary"
            size="x-large"
            rounded="pill"
            prepend-icon="mdi-camera"
            :loading="loading"
            @click="pickSource('camera')"
          >
            Take a Photo
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const gameStore = useGameStore()
const loading = ref(false)

async function pickSource(source: 'gallery' | 'camera') {
  loading.value = true
  try {
    // DataUrl mode with native resize constraints: Capacitor resizes the photo
    // on the native side before encoding to base64, so the data URL that lands
    // in JS is already small (~100 KB for a 1000×1250 JPEG at quality 85).
    // This avoids loading a full-resolution bitmap into WKWebView memory and
    // eliminates the separate cropToBoard canvas pass entirely.
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
      // Capacitor resizes natively before handing data to JS.
      width: 1000,
      height: 1250,
    })

    if (!photo.dataUrl) return

    gameStore.setImage(photo.dataUrl)
    router.push('/game')
  } catch (err) {
    console.warn('Photo pick cancelled or failed:', err)
  } finally {
    loading.value = false
  }
}
</script>

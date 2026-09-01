<template>
  <div
    ref="boardEl"
    class="puzzle-board"
    :style="boardStyle"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div
      v-for="tileValue in tileValues"
      :key="tileValue"
      class="puzzle-tile"
      :style="tileStyle(tileValue)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef, watch, onMounted, onUnmounted } from 'vue'
import { useGameStore, GRID_COLS, GRID_ROWS, BLANK, TILE_COUNT } from '@/stores/game'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

const gameStore = useGameStore()
const boardEl = ref<HTMLElement | null>(null)

const tileValues = Array.from({ length: TILE_COUNT - 1 }, (_, i) => i)

// ── Board dimensions ──────────────────────────────────────────────────────────

const displayW = ref(Math.min(window.innerWidth - 32, 480))
const tileW = computed(() => displayW.value / GRID_COLS)
const tileH = computed(() => tileW.value)
const displayH = computed(() => tileH.value * GRID_ROWS)

const boardStyle = computed(() => ({
  width:  `${displayW.value}px`,
  height: `${displayH.value}px`,
}))

function measure() {
  const newW = Math.min(window.innerWidth - 32, 480)
  if (newW !== displayW.value) displayW.value = newW
}

// ── Image metadata ────────────────────────────────────────────────────────────

interface ImgMeta {
  naturalW: number; naturalH: number
  cropX: number; cropY: number; cropW: number; cropH: number
}

const imgMeta = shallowRef<ImgMeta | null>(null)

function loadImageMeta(dataUrl: string) {
  imgMeta.value = null
  const img = new Image()
  img.onload = () => {
    const targetRatio = GRID_COLS / GRID_ROWS
    const imgRatio    = img.naturalWidth / img.naturalHeight
    let cropX: number, cropY: number, cropW: number, cropH: number
    if (imgRatio > targetRatio) {
      cropH = img.naturalHeight; cropW = cropH * targetRatio
      cropX = (img.naturalWidth - cropW) / 2; cropY = 0
    } else {
      cropW = img.naturalWidth; cropH = cropW / targetRatio
      cropX = 0; cropY = (img.naturalHeight - cropH) / 2
    }
    imgMeta.value = { naturalW: img.naturalWidth, naturalH: img.naturalHeight, cropX, cropY, cropW, cropH }
    img.onload = null; img.onerror = null
  }
  img.onerror = () => { img.onload = null; img.onerror = null }
  img.src = dataUrl
}

watch(() => gameStore.imageDataUrl, url => { if (url) loadImageMeta(url) }, { immediate: true })

// ── Tile style ────────────────────────────────────────────────────────────────

function tileStyle(tileValue: number) {
  const meta = imgMeta.value
  const url  = gameStore.imageDataUrl
  if (!meta || !url) return { visibility: 'hidden' }

  const pos = gameStore.tiles.indexOf(tileValue)
  const col = pos % GRID_COLS
  const row = Math.floor(pos / GRID_COLS)

  const scaleX = displayW.value / meta.cropW
  const scaleY = displayH.value / meta.cropH
  const srcCol = tileValue % GRID_COLS
  const srcRow = Math.floor(tileValue / GRID_COLS)
  const bgX    = (meta.cropX + srcCol * (meta.cropW / GRID_COLS)) * scaleX
  const bgY    = (meta.cropY + srcRow * (meta.cropH / GRID_ROWS)) * scaleY

  return {
    width:              `${tileW.value}px`,
    height:             `${tileH.value}px`,
    transform:          `translate(${col * tileW.value}px, ${row * tileH.value}px)`,
    backgroundImage:    `url(${url})`,
    backgroundSize:     `${meta.naturalW * scaleX}px ${meta.naturalH * scaleY}px`,
    backgroundPosition: `-${bgX}px -${bgY}px`,
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => window.addEventListener('resize', measure))
onUnmounted(() => window.removeEventListener('resize', measure))

// ── Touch handling ────────────────────────────────────────────────────────────
//
// Absolute minimum: record start in touchstart, commit in touchend.
// No gestureIsSwiping flag — on iOS fast swipes generate no touchmove events,
// so that flag stays false and everything fails.
// No startPos check — adds another failure mode; get basic sliding working first.
// Direction is determined from blank position + finger delta (changedTouches).

let touchStartX = 0
let touchStartY = 0

function onTouchStart(e: TouchEvent) {
  if (e.touches.length > 1) return
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY

  // Require at least 10px of movement to distinguish swipe from tap
  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return

  const blank = gameStore.blankIndex()
  const bRow  = Math.floor(blank / GRID_COLS)
  const bCol  = blank % GRID_COLS
  let targetPos = -1

  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx > 0 && bCol > 0)             targetPos = blank - 1
    if (dx < 0 && bCol < GRID_COLS - 1) targetPos = blank + 1
  } else {
    if (dy > 0 && bRow > 0)             targetPos = blank - GRID_COLS
    if (dy < 0 && bRow < GRID_ROWS - 1) targetPos = blank + GRID_COLS
  }

  if (targetPos < 0) return
  gameStore.slideTile(targetPos)
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
}
</script>

<style scoped>
.puzzle-board {
  position: relative;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  touch-action: none;
  user-select: none;
  overflow: hidden;
}

.puzzle-tile {
  position: absolute;
  top: 0;
  left: 0;
  touch-action: none;
  will-change: transform;
  transition: transform 150ms ease-in-out;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.18);
  box-sizing: border-box;
}
</style>

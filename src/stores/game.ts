import { defineStore } from 'pinia'
import { shallowRef, computed } from 'vue'

export const GRID_COLS = 4
export const GRID_ROWS = 5
export const TILE_COUNT = GRID_COLS * GRID_ROWS
export const BLANK = TILE_COUNT - 1

export const useGameStore = defineStore('game', () => {
  // shallowRef: Vue only tracks the array reference, not individual elements.
  // We replace the whole array on every slide so Vue detects the change AND
  // the watch callback receives the old array for animation comparison.
  const tiles = shallowRef<number[]>([])
  const imageDataUrl = shallowRef<string | null>(null)
  const moves = shallowRef(0)
  const hapticsEnabled = shallowRef(localStorage.getItem('hapticsEnabled') !== 'false')

  function toggleHaptics() {
    hapticsEnabled.value = !hapticsEnabled.value
    localStorage.setItem('hapticsEnabled', String(hapticsEnabled.value))
  }

  const isSolved = computed(() => tiles.value.every((t, i) => t === i))

  // Store the data URL directly — no blob URL conversion needed.
  // Capacitor already resized the photo natively before encoding,
  // so the data URL is small (~100 KB) and safe to hold in memory.
  function setImage(dataUrl: string) {
    imageDataUrl.value = dataUrl
  }

  function blankIndex(arr = tiles.value): number {
    return arr.indexOf(BLANK)
  }

  function movableNeighbors(blankIdx: number): number[] {
    const row = Math.floor(blankIdx / GRID_COLS)
    const col = blankIdx % GRID_COLS
    const n: number[] = []
    if (row > 0)             n.push(blankIdx - GRID_COLS)
    if (row < GRID_ROWS - 1) n.push(blankIdx + GRID_COLS)
    if (col > 0)             n.push(blankIdx - 1)
    if (col < GRID_COLS - 1) n.push(blankIdx + 1)
    return n
  }

  function shuffle(numMoves = 300) {
    const arr = Array.from({ length: TILE_COUNT }, (_, i) => i)
    let prevBlank = -1
    for (let i = 0; i < numMoves; i++) {
      const blank = arr.indexOf(BLANK)
      const neighbors = movableNeighbors(blank).filter(n => n !== prevBlank)
      const pick = neighbors[Math.floor(Math.random() * neighbors.length)]
      arr[blank] = arr[pick]
      arr[pick] = BLANK
      prevBlank = blank
    }
    tiles.value = arr
    moves.value = 0
  }

  function initBoard() {
    tiles.value = Array.from({ length: TILE_COUNT }, (_, i) => i)
    moves.value = 0
    shuffle()
  }

  function slideTile(tilePos: number): boolean {
    const arr = tiles.value
    const blank = arr.indexOf(BLANK)
    if (!movableNeighbors(blank).includes(tilePos)) return false
    // Replace array (not mutate) so watch receives old + new for animation
    const next = arr.slice()
    next[blank] = next[tilePos]
    next[tilePos] = BLANK
    tiles.value = next
    moves.value = moves.value + 1
    return true
  }

  return {
    tiles,
    imageDataUrl,
    moves,
    isSolved,
    hapticsEnabled,
    setImage,
    initBoard,
    shuffle,
    slideTile,
    blankIndex,
    toggleHaptics,
  }
})

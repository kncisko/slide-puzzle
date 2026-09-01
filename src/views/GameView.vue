<template>
  <v-app-bar density="compact" elevation="0">
    <v-btn icon="mdi-arrow-left" @click="router.push('/')" />
    <v-app-bar-title>Slide Puzzle</v-app-bar-title>
    <template #append>
      <v-btn icon="mdi-refresh" @click="gameStore.shuffle()" />
    </template>
  </v-app-bar>

  <v-main>
    <v-container class="fill-height pa-4" fluid>
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" class="d-flex flex-column align-center">

          <div class="move-counter mb-4 text-body-2 text-medium-emphasis">
            Moves: {{ gameStore.moves }}
          </div>

          <PuzzleBoard v-if="gameStore.imageDataUrl" />

          <div v-else class="text-center">
            <p class="text-medium-emphasis mb-4">No image loaded.</p>
            <v-btn variant="text" @click="router.push('/')">Go back</v-btn>
          </div>

        </v-col>
      </v-row>
    </v-container>
  </v-main>

  <v-dialog v-model="showWin" max-width="340">
    <v-card rounded="xl" class="text-center pa-6">
      <v-icon size="64" color="amber" class="mb-4">mdi-trophy</v-icon>
      <v-card-title class="text-h5 mb-2">Puzzle Solved!</v-card-title>
      <v-card-text class="text-body-1 mb-4">
        You completed the puzzle in {{ gameStore.moves }} moves.
      </v-card-text>
      <v-card-actions class="justify-center gap-3">
        <v-btn color="primary" rounded="pill" @click="playAgain">Play Again</v-btn>
        <v-btn variant="text" @click="router.push('/')">New Photo</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import PuzzleBoard from '@/components/PuzzleBoard.vue'

const router = useRouter()
const gameStore = useGameStore()

const showWin = computed(() => gameStore.isSolved && gameStore.moves > 0)

function playAgain() {
  gameStore.shuffle()
}

watch(() => gameStore.imageDataUrl, (url) => {
  if (url) gameStore.initBoard()
}, { immediate: true })
</script>

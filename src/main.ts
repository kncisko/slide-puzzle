import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { createRouter, createWebHashHistory } from 'vue-router'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import HomeView from './views/HomeView.vue'
import GameView from './views/GameView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/game', component: GameView },
  ],
})

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'dark',
  },
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)
app.mount('#app')

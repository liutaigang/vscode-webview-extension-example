import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { WEBVIEW_PUBLIC_PATH } from './constant'

const app = createApp(App)

app
  .use(createPinia())
  .use(router)
  .provide(WEBVIEW_PUBLIC_PATH, (window as any).__webview_public_path__)
  .mount('#app')

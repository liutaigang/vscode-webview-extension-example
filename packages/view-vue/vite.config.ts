import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vscodeWebviewHmr from 'vite-plugin-vscode-webview-hmr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vscodeWebviewHmr()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: '../extension/out/view-vue',
    rollupOptions: {
      external: [
        'extension/handlers-type' // ignore react stuff
      ]
    }
  }
});

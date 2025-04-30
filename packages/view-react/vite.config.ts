import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import vscodeWebviewHmr from 'vite-plugin-vscode-webview-hmr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vscodeWebviewHmr()],
  build: {
    outDir: '../extension/out/view-react',
  },
});

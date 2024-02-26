<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import logPath from '@/assets/logo.svg'
import { useWebviewPublicPath } from '@/hooks/use-webview-public-path'
import { useVscColorTheme, vscColorThemeOptions } from '@/hooks/use-vsc-color-theme'
import { useAxios } from '@/hooks/use-axios'
import { useMessage } from './hooks/use-message'
import { useCall } from './hooks/use-cec-client'

// Webview 公共资源地址示例
const logoUrl = useWebviewPublicPath(logPath)

// Vscode 主题监听和设置示例
const { colorTheme, setColorTheme } = useVscColorTheme()
const onColortThemeInput = () => {
  setTimeout(() => setColorTheme(colorTheme.value!))
}

// 网络请求示例
const whoami = ref()
const onAxiosRequestClick = async () => {
  const { get } = useAxios()
  const { data } = await get('https://developer.mozilla.org/api/v1/whoami')
  whoami.value = data
}

// Webview 之间的通信演示例
const messgeSend = ref('')
const { message: messageRecevice, sendMessageToReact } = useMessage()

const onViewReactPanelOpen = () => {
  useCall('Command.exec', 'panel-view-container.show')
}
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" :src="logoUrl" width="125" height="125" />
    <div class="example-block">
      <button @click="onViewReactPanelOpen()">打开 view-react 的 panel 窗口</button>
    </div>
    <div class="example-block">
      <h2>主题获取、监听和设置演示</h2>
      <label for="color-theme-select">请选择 Vscode 的主题:</label>
      <select id="color-theme-select" v-model="colorTheme" @input="onColortThemeInput()">
        <option v-for="{ value, label } of vscColorThemeOptions" :key="value" :value="value">
          {{ label }}
        </option>
      </select>
      <div>当前窗口 vscode 的主题类型: {{ colorTheme }}</div>
    </div>
    <div class="example-block">
      <h2>Axios 服务测试演示</h2>
      <button @click="onAxiosRequestClick()">请求数据</button>
      <div>数据：{{ whoami }}</div>
    </div>
    <div class="example-block">
      <h2>Webview 之间的通信演示</h2>
      <label for="webview-message-input">请输入消息：</label>
      <input type="text" id="webview-message-input" v-model="messgeSend" />
      <button @click="sendMessageToReact(messgeSend)">发送消息</button>
      <div>接受到的消息： {{ messageRecevice.value }}</div>
      <div>发送者： {{ messageRecevice.from }}</div>
    </div>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>
  <RouterView />
</template>

<style scoped>
.example-block {
  margin: 50px 0;
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>

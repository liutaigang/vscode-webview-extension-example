<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import logPath from '@/assets/logo.svg';
import { useWebviewPublicPath } from '@/hooks/use-webview-public-path';
import { useVscTheme, vscColorThemeOptions } from '@/hooks/use-vsc-theme';
import { useOnDidOpenTextDocument } from '@/hooks/use-on-did-open-text-document';
import { useMessage } from '@/hooks/use-message';
import { useHandlers } from '@/hooks/use-handlers';

const handlers = useHandlers();
// Webview 公共资源地址示例
const logoUrl = useWebviewPublicPath(logPath);

// Vscode 主题监听和设置示例
const { theme, setTheme } = useVscTheme();
const onColortThemeInput = () => {
  setTimeout(() => {
    setTheme(theme.value!).catch((error: any) => {
      handlers.showInformation(error.toString());
    });
  });
};

// 网络请求示例
const whoami = ref();
const onAxiosRequestClick = async () => {
  const { data } = await handlers.axiosGet('https://developer.mozilla.org/api/v1/whoami');
  whoami.value = data;
};

// Webview 之间的通信演示例
const messgeSend = ref('');
const { message: messageRecevice, sendMessageToReact } = useMessage();

const onViewReactPanelOpen = () => {
  handlers.execCommand('panel-view-container.show');
};
onMounted(() => {
  onViewReactPanelOpen();
});

// 文件打开监听演示
const fileName = ref('');
useOnDidOpenTextDocument((file) => {
  fileName.value = file.fileName;
});
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
      <select id="color-theme-select" v-model="theme" @input="onColortThemeInput()">
        <option v-for="{ value, label } of vscColorThemeOptions" :key="value" :value="value">
          {{ label }}
        </option>
      </select>
      <div>当前窗口 vscode 的主题类型: {{ theme }}</div>
    </div>
    <div className="example-block">
      <h2>文件打开监听演示</h2>
      <div>最新打开的文件： {{ fileName }}</div>
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

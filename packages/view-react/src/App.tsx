import { useState } from 'react';
import { useWebviewPublicPath } from './hooks/use-webview-public-path';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { useMessage } from './hooks/use-message';
import { useVscTheme, vscColorThemeOptions } from './hooks/use-vsc-theme';
import { useOnDidOpenTextDocument } from './hooks/use-on-did-open-text-document';

function App() {
  const [fileName, setFileName] = useState('');

  // Webview 公共资源地址示例
  const [reactLogoPath] = useWebviewPublicPath(reactLogo);
  const [viteLogoPath] = useWebviewPublicPath(viteLogo);

  // Webview 之间的通信演示例
  const [messgeInput, setMessageInput] = useState('');
  const { message: messageReceive, sendMessageToVue } = useMessage();

  // 主题
  const [theme, setTheme] = useVscTheme();
  const onColortThemeInput = (newTheme: string) => {
    setTimeout(() => setTheme(newTheme));
  };

  // 文件开启监视
  useOnDidOpenTextDocument((file) => {
    setFileName(file.fileName);
  });

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogoPath} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogoPath} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="example-block">
        <h2>文件打开监听演示</h2>
        <div>最新打开的文件： {fileName}</div>
      </div>
      <div className="example-block">
        <h2>Webview 之间的通信演示</h2>
        <label htmlFor="webview-message-input">请输入消息：</label>
        <input type="text" id="webview-message-input" onInput={(evt) => setMessageInput(evt.currentTarget.value)} />
        <button onClick={() => sendMessageToVue(messgeInput)}>发送消息</button>
        <div>接受到的消息： {messageReceive.value}</div>
        <div>发送者： {messageReceive.from}</div>
      </div>
      <div className="example-block">
        <h2>主题获取、监听和设置演示</h2>
        <label htmlFor="color-theme-select">请选择 Vscode 的主题: </label>
        <select id="color-theme-select" value={theme} onInput={(evt) => onColortThemeInput(evt.currentTarget.value)}>
          {vscColorThemeOptions.map(({ value, label }) => {
            return <option value={value}>{label}</option>;
          })}
        </select>
      </div>
    </>
  );
}

export default App;

import { useState } from 'react'
import { useWebviewPublicPath } from './hooks/use-webview-public-path'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useMessage } from './hooks/use-message'

function App() {
  const [count, setCount] = useState(0)

  // Webview 公共资源地址示例
  const [reactLogoPath] = useWebviewPublicPath(reactLogo)
  const [viteLogoPath] = useWebviewPublicPath(viteLogo)

  // Webview 之间的通信演示例
  const [messgeInput, setMessageInput] = useState('')
  const { message: messageReceive, sendMessageToVue } = useMessage()

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
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>

      <div className="example-block">
        <h2>Webview 之间的通信演示</h2>
        <label htmlFor="webview-message-input">请输入消息：</label>
        <input
          type="text"
          id="webview-message-input"
          onInput={(evt) => setMessageInput(evt.currentTarget.value)}
        />
        <button onClick={() => sendMessageToVue(messgeInput)}>发送消息</button>
        <div>接受到的消息： {messageReceive.value}</div>
        <div>发送者： {messageReceive.from}</div>
      </div>
    </>
  )
}

export default App

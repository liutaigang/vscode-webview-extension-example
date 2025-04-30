import { onUnmounted } from 'vue';
import { useHandlers } from './use-handlers';

type MessageType = { from?: string; value?: any }; // Webview 之间的君子约定，没有规定

const MY_MESSAGE_CHANNEL = 'view-vue';
const REACT_MESSAGE_CHANNEL = 'view-react';

const handlers = useHandlers();

// 注册一个 channel
handlers.registerChannel(MY_MESSAGE_CHANNEL);

// 发送消息
const sendMessage = (channel: string, value: any) => {
  const msgBody: MessageType = {
    from: MY_MESSAGE_CHANNEL,
    value,
  };
  handlers.sendMessage(channel, msgBody);
};

// 监听消息
const rmListenerSet = new Set<() => void>();
const listeningMessage = async (listener: (value?: any, from?: string) => void) => {
  const listenerNumber = await handlers.addMessageListener(MY_MESSAGE_CHANNEL, (msg: MessageType) => {
    const { value, from } = msg ?? {};
    listener(value, from);
  });

  const rmListener = () => {
    handlers.rmMessageListener(MY_MESSAGE_CHANNEL, listenerNumber);
  };

  onUnmounted(() => {
    if (rmListenerSet.delete(rmListener)) {
      rmListener();
    }
  });
};

// 在关闭页面(panel)时取消监听
window.addEventListener('unload', () => {
  for (const rmListener of rmListenerSet) {
    rmListenerSet.delete(rmListener);
    rmListener();
  }
});

export function useMessage() {
  return {
    listeningMessage,
    sendMessage,
    sendMessageToReact: sendMessage.bind({}, REACT_MESSAGE_CHANNEL),
  };
}

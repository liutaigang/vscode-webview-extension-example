import { useMemo } from 'react';
import { useHandlers } from './use-handlers';

type MessageType = { from?: string; value?: any }; // Webview 之间的君子约定，没有规定

const MY_MESSAGE_CHANNEL = 'view-react';
const VUE_MESSAGE_CHANNEL = 'view-vue';

export const useMessage = () => {
  const handlers = useHandlers();
  return useMemo(() => {
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
    const rmListenerSet: Set<Function> = new Set();
    const listeningMessage = (listener: (value?: any, from?: string) => void) => {
      let rmListener: () => void;
      (async () => {
        const listenerNumber = await handlers.addMessageListener(MY_MESSAGE_CHANNEL, (msg: MessageType) => {
          const { value, from } = msg ?? {};
          listener(value, from);
        });
        rmListener = () => {
          handlers.rmMessageListener(MY_MESSAGE_CHANNEL, listenerNumber);
        };
        rmListenerSet.add(rmListener);
      })();

      return () => {
        if (rmListenerSet.delete(rmListener)) {
          rmListener();
        }
      };
    };

    // 在关闭页面(panel)时取消监听
    window.addEventListener('unload', () => {
      for (const listener of rmListenerSet) {
        listener();
      }
      rmListenerSet.clear();
    });

    return {
      listeningMessage,
      sendMessage,
      sendMessageToVue: sendMessage.bind({}, VUE_MESSAGE_CHANNEL),
    };
  }, []);
};

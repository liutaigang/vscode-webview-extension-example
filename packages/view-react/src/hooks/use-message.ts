import { useEffect, useState } from 'react';
import { useHandlers } from './use-handlers';

const MY_MESSAGE_CHANNEL = 'view-react';
const VUE_MESSAGE_CHANNEL = 'view-vue';

export function useMessage() {
  const handlers = useHandlers();
  const addListener = (listener: (msgValue: any) => void) => {
    handlers.registerChannel(MY_MESSAGE_CHANNEL, listener); 
    return () => {
      handlers.unregisterChannel(MY_MESSAGE_CHANNEL);
    };
  };

  const sendMessage = (channel: string, value: any) => {
    const msgBody = { from: MY_MESSAGE_CHANNEL, value };
    handlers.sendMessage(channel, msgBody);
  };

  const [message, setMessage] = useState<{ from?: string; value?: any }>({});
  useEffect(() => {
    return addListener((msgBody) => setMessage(msgBody));
  }, []);

  return {
    message,
    sendMessage,
    sendMessageToVue: sendMessage.bind({}, VUE_MESSAGE_CHANNEL)
  };
}

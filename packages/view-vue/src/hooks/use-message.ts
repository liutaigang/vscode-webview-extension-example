import { onMounted, onUnmounted, ref } from 'vue';
import { useHandlers } from './use-handlers';

const MY_MESSAGE_CHANNEL = 'view-vue';
const REACT_MESSAGE_CHANNEL = 'view-react';

const handlers = useHandlers();
export function useMessage() {
  const addListener = (listener: (msgBody: { from: string; value: any }) => void) => {
    handlers.registerChannel(MY_MESSAGE_CHANNEL, listener);
    return () => {
      handlers.unregisterChannel(MY_MESSAGE_CHANNEL);
    };
  };
  const sendMessage = (channel: string, value: any) => {
    const msgBody = {
      from: MY_MESSAGE_CHANNEL,
      value
    };
    handlers.sendMessage(channel, msgBody);
  };

  const message = ref<{ from?: string; value?: any }>({} as any);
  onMounted(() => {
    const removeListener = addListener((msgBody) => (message.value = msgBody));
    onUnmounted(removeListener);
  });

  return {
    message,
    sendMessage,
    sendMessageToReact: sendMessage.bind({}, REACT_MESSAGE_CHANNEL)
  };
}

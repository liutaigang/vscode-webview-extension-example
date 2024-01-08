import { useEffect, useState } from 'react'
import { useCall, useSubscrible } from './use-cec-client'

const MY_MESSAGE_SUBJECT_NAME = 'view-react'
const VUE_MESSAGE_SUBJECT_NAME = 'view-vue'

export function useMessage() {
  const addMessageListener = (listener: (msgValue: any) => void) => {
    return useSubscrible('Message.register', listener, MY_MESSAGE_SUBJECT_NAME)
  }

  const sendMessage = (toMessageSubjectName: string, msgValue: any) => {
    const msgBody = {
      from: MY_MESSAGE_SUBJECT_NAME,
      value: msgValue
    }
    useCall('Message.send', toMessageSubjectName, msgBody)
  }

  const [message, setMessage] = useState<{ from?: string; value?: any }>({})
  useEffect(() => {
    return addMessageListener((msgBody) => {
      setMessage(msgBody)
    })
  }, [])

  return {
    message,
    sendMessage,
    sendMessageToVue: sendMessage.bind({}, VUE_MESSAGE_SUBJECT_NAME)
  }
}

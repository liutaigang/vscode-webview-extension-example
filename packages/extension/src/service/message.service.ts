export class MessageService {
  private channelListenerMap = new Map<string, Map<number, (value: any) => void>>();
  private listenerNumber = 0;

  register(channel: string) {
    if (!this.channelListenerMap.has(channel)) {
      this.channelListenerMap.set(channel, new Map());
    }
  }

  unregister(channel: string) {
    return this.channelListenerMap.delete(channel);
  }

  sendMessage(channel: string, message: any): Promise<string | void> {
    if (this.channelListenerMap.has(channel)) {
      const listeners = this.channelListenerMap.get(channel)!;
      for (const [_, listener] of listeners) {
        listener.call({}, message);
      }
      return Promise.resolve();
    } else {
      return Promise.resolve(`The channel: ${channel} is not exist !`);
    }
  }

  addMessageListener(channel: string, listener: (msg: any) => void): Promise<number> {
    if (this.channelListenerMap.has(channel)) {
      const listeners = this.channelListenerMap.get(channel)!;
      listeners.set(++this.listenerNumber, listener);
      return Promise.resolve(this.listenerNumber);
    } else {
      return Promise.reject(`The channel: ${channel} is not exist !`);
    }
  }

  rmMessageListener(channel: string, listenerNumber: number) {
    if (this.channelListenerMap.has(channel)) {
      const listeners = this.channelListenerMap.get(channel)!;
      return listeners.delete(listenerNumber);
    }
    return false;
  }
}

export class MessageService {
  private channelListenerMap = new Map<string, (value: any) => void>();

  register(channel: string, listener: (value: any) => void) {
    this.channelListenerMap.set(channel, listener);
  }

  unregister(channel: string) {
    this.channelListenerMap.delete(channel);
  }

  send(channel: string, value: any) {
    if (!this.channelListenerMap.has(channel)) {
      return Promise.reject(`The channel: ${channel} is not exist !`);
    } else {
      const observer = this.channelListenerMap.get(channel)!;
      observer.call({}, value);
      return Promise.resolve('success');
    }
  }
}

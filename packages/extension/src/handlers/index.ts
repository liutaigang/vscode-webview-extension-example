import { workspace, commands, type ExtensionContext, window, type TextDocument } from 'vscode';
import { type Publisher, asBehaviorSubject, asNotify, asSubject } from '@jsonrpc-rx/server';
import { MessageService } from '../service/message.service';
import type { AxiosRequestConfig } from 'axios';
import { AxiosService } from '../service/axios.service';
import { toPromise } from '../util/to-promise';

const messageService = new MessageService();
const axiosService = new AxiosService();

export const getHandlers = (context: ExtensionContext) => {
  return {
    /** ---关于 showMessage-------------------------------------------------------------------------------- */

    /**
     * WebView 可以使用它调用 Vscode 的右下角的消息通知，这里使用通知（asNotify）的原因是，WebView 的调用者并不关心返回值或者返回状态
     * @param message
     */
    showInformation: asNotify((message: string) => {
      window.showInformationMessage(message);
    }),

    /** ---关于主题----------------------------------------------------------------------------------------- */

    /**
     * WebView 可以使用它获得当前工作区的风格主题
     * @returns 当前工作区的风格主题
     */
    getTheme: () => {
      return workspace.getConfiguration().get('workbench.colorTheme') as string;
    },

    /**
     * WebView 可以使用它设置当前工作区的风格主题
     * @param theme 风格主题
     * @returns 执行结果
     */
    setTheme: (theme: string) => {
      const then = workspace.getConfiguration().update('workbench.colorTheme', theme);
      return toPromise(then);
    },

    /**
     * WebView 可以使用它监听当前工作区的风格主题的变化。
     * 使用 asBehaviorSubject 修饰后，代表 onThemeChange 会以 BehaviorSubject 形式的呈现给订阅者，
     * （类似于 rxjs 的 BehaviorSubject ———— Subject 的一个变体是BehaviorSubject，它有一个“当前值”的概念。它存储发送给消费者的最新值，每当有新的观察者订阅时，它都会立即从 接收“当前值” ）。
     */
    onThemeChange: asBehaviorSubject(({ next }) => {
      const disposable = workspace.onDidChangeConfiguration(() => {
        const colorTheme = workspace.getConfiguration().get('workbench.colorTheme');
        next(colorTheme);
      });
      context.subscriptions.push(disposable);
      return disposable.dispose.bind(disposable);
    }, workspace.getConfiguration().get('workbench.colorTheme')),

    /** ---关于 Webview之间的通信---------------------------------------------------------------------------------------- */

    /**
     * 注册一个管道，一般来说，一个 Webview 应用注册一个管道就可以了（在前端页面中注册），其他的 Webview 可以通过它给持有者发送消息
     * @param channel 管道（频道）名
     */
    registerChannel: (channel: string) => {
      messageService.register(channel);
    },

    /**
     * 注销一个管道，不再使用时，需要注销
     * @param channel 管道（频道）名
     * @returns 是否成功
     */
    unregisterChannel: (channel: string) => {
      return messageService.unregister(channel);
    },

    /**
     * 发送消息，需要知道接受方的管道名
     * @param channel 接受方的管道名
     * @param message 消息
     * @returns 发送失败会返回具体原因，成功则返回空
     */
    sendMessage: (channel: string, message: any) => {
      return messageService.sendMessage(channel, message);
    },

    /**
     * 监听消息
     * @param channel 己方的管道名
     * @param listener 监听者
     * @returns 成功————返回监听者序号（取消监听时使用），失败————返回具体原因
     */
    addMessageListener(channel: string, listener: (msg: any) => void): Promise<number> {
      return messageService.addMessageListener(channel, listener);
    },

    /**
     * 取消监听，移除监听者
     * @param channel 管道名
     * @param listenerNumber 监听者序号
     * @returns 是否成功
     */
    rmMessageListener(channel: string, listenerNumber: number) {
      return messageService.rmMessageListener(channel, listenerNumber);
    },

    /** ---关于指令---------------------------------------------------------------------------------------- */
    // WebView 可以使用它直接执行 Vscode 的指令
    execCommand: (command: string, ...rest: any[]) => {
      const then = commands.executeCommand(command, ...rest);
      return toPromise(then);
    },

    /** ---关于 axios 请求---------------------------------------------------------------------------------
     * （因为前端是运行在 vscode 的 WebView 中，从前端发出的请求会与服务并非同源。一般情况下，由于“同源策略”的限制，非同源的请求不被许可。可以从 extension 中发送请求，绕过“同源策略”）
     */

    /**
     * 使用 axios 发送 GET 请求
     * @param url URL
     * @param config AxiosConfig
     * @returns 请求结果
     */
    axiosGet: (url: string, config?: AxiosRequestConfig): Promise<any> => {
      return axiosService.get(url, config);
    },

    /**
     * 使用 axios 发送 POST 请求
     * @param url URL
     * @param config AxiosConfig
     * @returns 请求结果
     */
    axiosPost: (url: string, data?: any, config?: AxiosRequestConfig): Promise<any> => {
      return axiosService.post(url, data, config);
    },

    /**
     * 使用 axios 发送 PUT 请求
     * @param url URL
     * @param config AxiosConfig
     * @returns 请求结果
     */
    axiosPut: (url: string, data?: any, config?: AxiosRequestConfig): Promise<any> => {
      return axiosService.put(url, data, config);
    },

    /**
     * 使用 axios 发送 DELETE 请求
     * @param url URL
     * @param config AxiosConfig
     * @returns 请求结果
     */
    axiosDelete: (url: string, config?: AxiosRequestConfig): Promise<any> => {
      return axiosService.delete(url, config);
    },

    /** ---文档打开监听------------------------------------------------------------------------------------ */

    /**
     * WebView 可以使用它监听工作空间中某个文件的打开。
     * 使用 asSubject 修饰后，代表 onDidOpenTextDocument 会以 Subject 形式的呈现给订阅者（类似于 rxjs 的 Subject）。
     */
    onDidOpenTextDocument: asSubject(({ next }: Publisher<TextDocument>) => {
      const disposable = workspace.onDidOpenTextDocument((file) => next(file));
      return disposable.dispose.bind(disposable);
    })
  };
};

export type HandlersType = ReturnType<typeof getHandlers>;

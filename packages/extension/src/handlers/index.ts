import { workspace, commands, type ExtensionContext, window, type TextDocument } from 'vscode';
import { type Publisher, asBehaviorSubject, asNotify } from '@jsonrpc-rx/server';
import { MessageService } from '../service/message.service';
import { Deferred } from '../util/deferred';
import { type AxiosRequestConfig } from 'axios';
import { AxiosService } from '../service/axios.service';

const messageService = new MessageService();
const axiosService = new AxiosService();

export const getHandlers = (context: ExtensionContext) => {
  return {
    // 关于 showMessage
    ... {
      showInformation: asNotify((message: string) => {
        window.showInformationMessage(message);
      })
    },
    // 关于主题
    ...{
      getTheme: () => {
        return workspace.getConfiguration().get('workbench.colorTheme') as string;
      },
      setTheme: (theme: string) => {
        const { promise, resolve, reject } = new Deferred();
        workspace.getConfiguration().update('workbench.colorTheme', theme).then(resolve, reject);
        return promise;
      },
      onThemeChange: asBehaviorSubject(({ next }) => {
        const disposable = workspace.onDidChangeConfiguration(() => {
          const colorTheme = workspace.getConfiguration().get('workbench.colorTheme');
          next(colorTheme);
        });
        context.subscriptions.push(disposable);
        return disposable.dispose.bind(disposable);
      }, workspace.getConfiguration().get('workbench.colorTheme'))
    },
    // 关于通信
    ...{
      registerChannel: (channel: string, listener: (value: any) => void) => {
        messageService.register(channel, listener);
      },
      unregisterChannel: (channel: string) => {
        messageService.unregister(channel);
      },
      sendMessage: (channel: string, value: any) => {
        return messageService.send(channel, value);
      }
    },
    // 关于指令
    ...{
      execCommand: (command: string, ...rest: any[]) => {
        const { promise, reject, resolve } = new Deferred<any>();
        commands.executeCommand(command, ...rest).then(resolve, reject);
        return promise;
      }
    },
    // 关于 axios 请求
    ...{
      axiosGet: (url: string, config?: AxiosRequestConfig): Promise<any> => {
        return axiosService.get(url, config);
      },

      axiosPost: (url: string, data?: any, config?: AxiosRequestConfig): Promise<any> => {
        return axiosService.post(url, data, config);
      },

      axiosPut: (url: string, data?: any, config?: AxiosRequestConfig): Promise<any> => {
        return axiosService.put(url, data, config);
      },

      axiosDelete: (url: string, config?: AxiosRequestConfig): Promise<any> => {
        return axiosService.delete(url, config);
      }
    },
    // 文档打开监听
    ...{
      onDidOpenTextDocument: asBehaviorSubject(({next}: Publisher<TextDocument>) => {
        const disposable = workspace.onDidOpenTextDocument((file) => {
          next(file);
        })
        return disposable.dispose.bind(disposable);
      }, null),
    }
  };
};

export type HandlersType = ReturnType<typeof getHandlers>;

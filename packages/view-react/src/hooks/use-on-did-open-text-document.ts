import { useEffect } from 'react';
import { useHandlers } from './use-handlers';

export type FileDocument = {
  readonly uri: string;
  readonly fileName: string;
};

// 监听工作空间的某个文件的打开
export const useOnDidOpenTextDocument = (listener: (file: FileDocument) => void) => {
  const handlers = useHandlers();

  useEffect(() => {
    const dispose = handlers.onDidOpenTextDocument({
      next: listener as any
    });
    return () => {
      dispose.then((d) => d());
    };
  });
};

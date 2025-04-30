import { useHandlers } from './use-handlers';
import { onMounted, onUnmounted } from 'vue';
import type { Dispose } from '@jsonrpc-rx/client';

export type FileDocument = {
  readonly uri: string;
  readonly fileName: string;
};

const handlers = useHandlers();

// 监听工作空间的某个文件的打开
export const useOnDidOpenTextDocument = (listener: (file: FileDocument) => void) => {
  let dispose: Dispose;
  onMounted(async () => {
    dispose = await handlers.onDidOpenTextDocument({
      next: listener as any,
    });
  });

  onUnmounted(() => {
    dispose?.();
  });
};

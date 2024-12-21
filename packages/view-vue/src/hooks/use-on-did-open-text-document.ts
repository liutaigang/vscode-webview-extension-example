import { useHandlers } from './use-handlers';
import { onMounted, onUnmounted } from 'vue';
import type { Dispose } from '@jsonrpc-rx/client';

export type FileDocument = {
  readonly uri: string;
  readonly fileName: string;
};

export const useOnDidOpenTextDocument = (listener: (file: FileDocument) => void) => {
  const handlers = useHandlers();

  let dispose: Dispose;
  onMounted(async () => {
    dispose = await handlers.onDidOpenTextDocument({
      next: listener as any
    });
  });

  onUnmounted(() => {
    dispose?.();
  });
};

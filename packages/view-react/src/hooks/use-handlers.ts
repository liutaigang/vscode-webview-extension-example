import { wrap } from '@jsonrpc-rx/client';
import { HandlersType } from 'extension/handlers-type';
import { useContext } from 'react';
import { JsonrpcClientContext } from '../contexts/jsonrpc-rx-context';

export const useHandlers = () => {
  const jsonrpcClient = useContext(JsonrpcClientContext);
  if (jsonrpcClient == null) {
    throw new Error('useHandlers must be used within a JsonrpcClientContextProvider');
  }
  return wrap<HandlersType>(jsonrpcClient);
};

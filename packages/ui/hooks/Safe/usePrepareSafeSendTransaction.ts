// Forked from wagmi
// https://github.com/wevm/wagmi/blob/1.x/packages/react/src/hooks/transactions/usePrepareSendTransaction.ts
import {
  type GetWalletClientResult,
  type PrepareSendTransactionArgs,
  type PrepareSendTransactionResult,
} from "@wagmi/core";
import { useNetwork, useQuery, useWalletClient } from "wagmi";
import type { QueryConfig, QueryFunctionArgs } from "./types";
import { prepareSafeSendTransaction } from "./prepareSafeSendTransaction";

export type UsePrepareSendTransactionConfig = Partial<PrepareSendTransactionArgs> &
  QueryConfig<PrepareSendTransactionResult, Error>;

type QueryKeyArgs = Partial<PrepareSendTransactionArgs>;
type QueryKeyConfig = Pick<UsePrepareSendTransactionConfig, "scopeKey"> & {
  activeChainId?: number;
  walletClientAddress?: string;
};

function queryKey({
  accessList,
  account,
  activeChainId,
  chainId,
  data,
  gas,
  gasPrice,
  maxFeePerGas,
  maxPriorityFeePerGas,
  nonce,
  to,
  value,
  scopeKey,
  walletClientAddress,
}: QueryKeyArgs & QueryKeyConfig) {
  return [
    {
      entity: "prepareSendTransaction",
      activeChainId,
      accessList,
      account,
      chainId,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
      scopeKey,
      walletClientAddress,
    },
  ] as const;
}

function queryFn({ walletClient }: { walletClient?: GetWalletClientResult }) {
  return ({
    queryKey: [
      {
        accessList,
        account,
        chainId,
        data,
        gas,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        value,
      },
    ],
  }: QueryFunctionArgs<typeof queryKey>) => {
    if (!to) throw new Error("to is required");
    return prepareSafeSendTransaction({
      accessList,
      account,
      chainId,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
      walletClient,
    });
  };
}

/**
 * @description Hook for preparing a transaction to be sent via [`useSendTransaction`](/docs/hooks/useSendTransaction).
 *
 * Eagerly fetches the parameters required for sending a transaction such as the gas estimate and resolving an ENS address (if required).
 *
 * @example
 * import { useSendTransaction, usePrepareSendTransaction } from 'wagmi'
 *
 * const { request } = usePrepareSendTransaction({
 *   to: 'moxey.eth',
 *   value: parseEther('1'),
 * })
 * const result = useSendTransaction(request)
 */
export function usePrepareSafeSendTransaction({
  accessList,
  account,
  chainId,
  cacheTime,
  data,
  enabled = true,
  gas,
  gasPrice,
  maxFeePerGas,
  maxPriorityFeePerGas,
  nonce,
  scopeKey,
  staleTime,
  suspense,
  to,
  value,
  onError,
  onSettled,
  onSuccess,
}: UsePrepareSendTransactionConfig = {}) {
  const { chain: activeChain } = useNetwork();
  const { data: walletClient } = useWalletClient({ chainId });

  const prepareSendTransactionQuery = useQuery(
    queryKey({
      accessList,
      activeChainId: activeChain?.id,
      account,
      chainId,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      scopeKey,
      to,
      value,
      walletClientAddress: walletClient?.account.address,
    }),
    queryFn({ walletClient }),
    {
      cacheTime,
      enabled: Boolean(enabled && walletClient && to),
      staleTime,
      suspense,
      onError,
      onSettled,
      onSuccess,
    },
  );

  return Object.assign(prepareSendTransactionQuery, {
    config: {
      mode: "prepared",
      ...(prepareSendTransactionQuery.isSuccess ? prepareSendTransactionQuery.data : undefined),
    } as PrepareSendTransactionResult,
  });
}

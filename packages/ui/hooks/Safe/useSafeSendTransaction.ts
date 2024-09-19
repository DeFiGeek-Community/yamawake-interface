// Forked from wagmi
// https://github.com/wevm/wagmi/blob/1.x/packages/react/src/hooks/transactions/useSendTransaction.ts
import type { SendTransactionArgs, SendTransactionResult } from "@wagmi/core";
import { sendTransaction } from "@wagmi/core";
import * as React from "react";
import { useMutation } from "wagmi";
import type { MutationConfig } from "./types";
import { sendSafeTransaction } from "./sendSafeTransaction";

export type UseSafeSendTransactionArgs<
  TMode extends "prepared" | undefined = "prepared" | undefined,
> = Omit<SendTransactionArgs, "to"> & { mode?: TMode; to?: string } & {
  safeAddress?: `0x${string}`;
};
export type UseSafeSendTransactionMutationArgs = SendTransactionArgs & {
  safeAddress?: `0x${string}`;
};
export type UseSafeSendTransactionConfig = MutationConfig<
  SendTransactionResult,
  Error,
  UseSafeSendTransactionArgs
>;

type SendTransactionFn = (overrideConfig?: UseSafeSendTransactionMutationArgs) => void;
type SendTransactionAsyncFn = (
  overrideConfig?: UseSafeSendTransactionMutationArgs,
) => Promise<SendTransactionResult>;
type MutateFnReturnValue<TMode, TFn> = TMode extends "prepared" ? TFn | undefined : TFn;

export const mutationKey = (args: UseSafeSendTransactionArgs) =>
  [{ entity: "sendTransaction", ...args }] as const;

const mutationFn = ({
  accessList,
  account,
  chainId,
  data,
  gas,
  gasPrice,
  maxFeePerGas,
  maxPriorityFeePerGas,
  mode,
  nonce,
  to,
  value,
  safeAddress,
}: UseSafeSendTransactionArgs) => {
  if (!to) throw new Error("to is required.");
  return safeAddress
    ? sendSafeTransaction({
        accessList,
        account,
        chainId,
        data,
        gas,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        mode,
        nonce,
        to,
        value,
        safeAddress,
      })
    : sendTransaction({
        accessList,
        account,
        chainId,
        data,
        gas,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        mode,
        nonce,
        to,
        value,
      });
};

/**
 * @description Hook for sending a transaction.
 *
 * It is recommended to pair this with the [`usePrepareSendTransaction` hook](/docs/prepare-hooks/usePrepareSendTransaction)
 * to [avoid UX pitfalls](https://wagmi.sh/react/prepare-hooks#ux-pitfalls-without-prepare-hooks).
 *
 * @example
 * import { useSendTransaction, usePrepareSendTransaction } from 'wagmi'
 *
 * const config = usePrepareSendTransaction({
 *   request: {
 *     to: 'moxey.eth',
 *     value: parseEther('1'),
 *   }
 * })
 * const result = useSendTransaction(config)
 */
export function useSafeSendTransaction<TMode extends "prepared" | undefined = undefined>({
  accessList,
  account,
  chainId,
  data: data_,
  gas,
  gasPrice,
  maxFeePerGas,
  maxPriorityFeePerGas,
  mode,
  nonce,
  to,
  value,
  safeAddress,
  onError,
  onMutate,
  onSettled,
  onSuccess,
}: UseSafeSendTransactionArgs<TMode> & UseSafeSendTransactionConfig = {}) {
  const {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    mutate,
    mutateAsync,
    reset,
    status,
    variables,
  } = useMutation(
    mutationKey({
      safeAddress,
      accessList,
      account,
      chainId,
      data: data_,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      mode,
      nonce,
      to,
      value,
    }),
    mutationFn,
    {
      onError,
      onMutate,
      onSettled,
      onSuccess,
    },
  );

  const sendTransaction = React.useCallback(
    (args?: UseSafeSendTransactionMutationArgs) =>
      mutate({
        chainId,
        mode,
        ...(args || {
          accessList,
          account,
          chainId,
          data: data_,
          gas,
          gasPrice,
          maxFeePerGas,
          maxPriorityFeePerGas,
          mode,
          nonce,
          value,
          to,
          safeAddress,
        }),
      }),
    [
      accessList,
      account,
      chainId,
      data_,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      mode,
      mutate,
      nonce,
      to,
      value,
    ],
  );

  const sendTransactionAsync = React.useCallback(
    (args?: UseSafeSendTransactionMutationArgs) =>
      mutateAsync({
        chainId,
        mode,
        ...(args || {
          accessList,
          account,
          chainId,
          data: data_,
          gas,
          gasPrice,
          maxFeePerGas,
          maxPriorityFeePerGas,
          mode,
          nonce,
          value,
          to,
          safeAddress,
        }),
      }),
    [
      accessList,
      account,
      chainId,
      data_,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      mode,
      mutateAsync,
      nonce,
      to,
      value,
      safeAddress,
    ],
  );

  return {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    reset,
    sendTransaction: (mode === "prepared" && !to
      ? undefined
      : sendTransaction) as MutateFnReturnValue<TMode, SendTransactionFn>,
    sendTransactionAsync: (mode === "prepared" && !to
      ? undefined
      : sendTransactionAsync) as MutateFnReturnValue<TMode, SendTransactionAsyncFn>,
    status,
    variables,
  };
}

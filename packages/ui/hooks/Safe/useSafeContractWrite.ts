// Forked from wagmi
// https://github.com/wevm/wagmi/blob/1.x/packages/react/src/hooks/contracts/useContractWrite.ts
import type {
  PrepareWriteContractResult,
  WriteContractMode,
  WriteContractResult,
  WriteContractUnpreparedArgs,
} from "@wagmi/core";
import { writeContract } from "@wagmi/core";
import { getSendTransactionParameters } from "@wagmi/core/internal";
import type { Abi } from "abitype";
import * as React from "react";
import type { GetFunctionArgs, SendTransactionParameters } from "viem";
import { useMutation } from "wagmi";
import type { PartialBy } from "viem/_types/types/utils";
import type { UseMutationOptions } from "@tanstack/react-query";
import { writeSafeContract } from "./writeSafeContract";

export type MutationConfig<Data, Error, Variables = void> = {
  /** Function fires if mutation encounters error */
  onError?: UseMutationOptions<Data, Error, Variables>["onError"];
  /**
   * Function fires before mutation function and is passed same variables mutation function would receive.
   * Value returned from this function will be passed to both onError and onSettled functions in event of a mutation failure.
   */
  onMutate?: UseMutationOptions<Data, Error, Variables>["onMutate"];
  /** Function fires when mutation is either successfully fetched or encounters error */
  onSettled?: UseMutationOptions<Data, Error, Variables>["onSettled"];
  /** Function fires when mutation is successful and will be passed the mutation's result */
  onSuccess?: UseMutationOptions<Data, Error, Variables>["onSuccess"];
};

type UseSafeContractWritePreparedArgs<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = Partial<Pick<PrepareWriteContractResult<TAbi, TFunctionName>, "request">> & {
  abi?: never;
  accessList?: never;
  account?: never;
  address?: never;
  args?: never;
  chainId?: never;
  dataSuffix?: never;
  functionName?: never;
  gas?: never;
  gasPrice?: never;
  maxFeePerGas?: never;
  maxPriorityFeePerGas?: never;
  nonce?: never;
  value?: never;
  safeAddress?: `0x${string}`;
};

type UseSafeContractWriteUnpreparedArgs<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = PartialBy<
  Omit<WriteContractUnpreparedArgs<TAbi, TFunctionName>, "args">,
  "abi" | "address" | "functionName"
> &
  Partial<GetFunctionArgs<TAbi, TFunctionName>> & {
    request?: never;
    safeAddress?: `0x${string}`;
  };

export type UseSafeContractWriteArgs<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TMode extends WriteContractMode = undefined,
> = { mode?: TMode } & (TMode extends "prepared"
  ? UseSafeContractWritePreparedArgs<TAbi, TFunctionName>
  : UseSafeContractWriteUnpreparedArgs<TAbi, TFunctionName>);

export type UseSafeContractWriteConfig<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TMode extends WriteContractMode = undefined,
> = MutationConfig<
  WriteContractResult,
  Error,
  UseSafeContractWriteArgs<TAbi, TFunctionName, TMode>
> &
  UseSafeContractWriteArgs<TAbi, TFunctionName, TMode>;

function mutationKey({
  safeAddress,
  address,
  abi,
  functionName,
  ...config
}: UseSafeContractWriteArgs) {
  const {
    args,
    accessList,
    account,
    dataSuffix,
    gas,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    request,
    value,
  } = config;
  return [
    {
      entity: "writeContract",
      safeAddress,
      address,
      args,
      abi,
      accessList,
      account,
      dataSuffix,
      functionName,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      request,
      value,
    },
  ] as const;
}

function mutationFn(config: UseSafeContractWriteArgs<Abi, string, WriteContractMode>) {
  if (config.mode === "prepared") {
    if (!config.request) throw new Error("request is required");

    return config.safeAddress
      ? writeSafeContract({
          mode: "prepared",
          request: config.request,
          safeAddress: config.safeAddress,
        })
      : writeContract({
          mode: "prepared",
          request: config.request,
        });
  }

  if (!config.address) throw new Error("address is required");
  if (!config.abi) throw new Error("abi is required");
  if (!config.functionName) throw new Error("functionName is required");

  return config.safeAddress
    ? writeSafeContract({
        safeAddress: config.safeAddress,
        address: config.address,
        args: config.args as unknown[],
        chainId: config.chainId,
        abi: config.abi as Abi, // TODO: Remove cast and still support `Narrow<TAbi>`
        functionName: config.functionName,
        accessList: config.accessList,
        account: config.account,
        dataSuffix: config.dataSuffix,
        gas: config.gas,
        gasPrice: config.gasPrice,
        maxFeePerGas: config.maxFeePerGas,
        maxPriorityFeePerGas: config.maxPriorityFeePerGas,
        nonce: config.nonce,
        value: config.value,
      })
    : writeContract({
        address: config.address,
        args: config.args as unknown[],
        chainId: config.chainId,
        abi: config.abi as Abi, // TODO: Remove cast and still support `Narrow<TAbi>`
        functionName: config.functionName,
        accessList: config.accessList,
        account: config.account,
        dataSuffix: config.dataSuffix,
        gas: config.gas,
        gasPrice: config.gasPrice,
        maxFeePerGas: config.maxFeePerGas,
        maxPriorityFeePerGas: config.maxPriorityFeePerGas,
        nonce: config.nonce,
        value: config.value,
      });
}

/**
 * @description Hook for calling a contract nonpayable or payable function.
 *
 * It is highly recommended to pair this with the [`usePrepareContractWrite` hook](/docs/prepare-hooks/usePrepareContractWrite)
 * to [avoid UX pitfalls](https://wagmi.sh/react/prepare-hooks#ux-pitfalls-without-prepare-hooks).
 *
 * @example
 * import { useContractWrite, usePrepareContractWrite } from 'wagmi'
 *
 * const { config } = usePrepareContractWrite({
 *  address: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
 *  abi: wagmigotchiABI,
 *  functionName: 'feed',
 * })
 * const { data, isLoading, isSuccess, write } = useContractWrite(config)
 *
 */
export function useSafeContractWrite<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined,
>(config: UseSafeContractWriteConfig<TAbi, TFunctionName, TMode>) {
  const { safeAddress, address, abi, args, chainId, functionName, mode, request, dataSuffix } =
    config;
  const { accessList, account, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, value } =
    getSendTransactionParameters(config);

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
      address,
      abi,
      functionName,
      chainId,
      mode,
      args,
      accessList,
      account,
      dataSuffix,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      request: request,
      value,
    } as UseSafeContractWriteArgs),
    mutationFn,
    {
      onError: config.onError as UseSafeContractWriteConfig["onError"],
      onMutate: config.onMutate as UseSafeContractWriteConfig["onMutate"],
      onSettled: config.onSettled as UseSafeContractWriteConfig["onSettled"],
      onSuccess: config.onSuccess as UseSafeContractWriteConfig["onSuccess"],
    },
  );

  const write = React.useMemo(() => {
    if (config.mode === "prepared") {
      if (!request) return undefined;

      return () =>
        mutate({
          mode: "prepared",
          request: config.request,
          chainId: config.chainId,
          safeAddress,
        } as unknown as UseSafeContractWriteArgs);
    }

    return (overrideConfig?: MutationFnArgs<TAbi, TFunctionName>) =>
      mutate({
        safeAddress,
        address,
        args,
        abi: abi as Abi,
        functionName,
        chainId,
        accessList,
        account,
        dataSuffix,
        gas,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        value,
        ...overrideConfig,
      } as UseSafeContractWriteArgs);
  }, [
    accessList,
    account,
    abi,
    address,
    args,
    chainId,
    config.chainId,
    config.mode,
    config.request,
    dataSuffix,
    functionName,
    gas,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    mutate,
    nonce,
    request,
    value,
  ]) as MutationFn<TMode, TAbi, TFunctionName, void>;

  const writeAsync = React.useMemo(() => {
    if (config.mode === "prepared") {
      if (!request) return undefined;
      return () =>
        mutateAsync({
          mode: "prepared",
          request: config.request,
          safeAddress,
        } as unknown as UseSafeContractWriteArgs);
    }

    return (overrideConfig?: MutationFnArgs<TAbi, TFunctionName>) =>
      mutateAsync({
        safeAddress,
        address,
        args,
        abi: abi as Abi,
        chainId,
        functionName,
        accessList,
        account,
        dataSuffix,
        gas,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        value,
        ...overrideConfig,
      } as UseSafeContractWriteArgs);
  }, [
    accessList,
    account,
    abi,
    address,
    args,
    chainId,
    config.mode,
    config.request,
    dataSuffix,
    functionName,
    gas,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    mutateAsync,
    nonce,
    request,
    value,
  ]) as MutationFn<TMode, TAbi, TFunctionName, Promise<WriteContractResult>>;

  return {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    reset,
    status,
    variables,
    write,
    writeAsync,
  };
}

type MutationFnArgs<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = Omit<SendTransactionParameters, "account" | "chain"> & {
  args?: WriteContractUnpreparedArgs<TAbi, TFunctionName> extends {
    args: unknown;
  }
    ? WriteContractUnpreparedArgs<TAbi, TFunctionName>["args"]
    : unknown;
};

type MutationFn<
  TMode extends WriteContractMode,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TReturnType,
> = TMode extends "prepared"
  ? (() => TReturnType) | undefined
  : (config?: MutationFnArgs<TAbi, TFunctionName>) => TReturnType;

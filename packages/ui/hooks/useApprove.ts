import { usePrepareContractWrite, useWaitForTransaction, useContractRead, erc20ABI } from "wagmi";
import { useState } from "react";
import { useSafeContractWrite, useSafeWaitForTransaction } from "./Safe";

export default function useApprove({
  chainId,
  targetAddress,
  owner,
  spender,
  enabled,
  amount,
  safeAddress,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
}: {
  chainId: number;
  targetAddress: `0x${string}` | null;
  owner: `0x${string}`;
  spender: `0x${string}`;
  enabled: boolean;
  amount?: bigint;
  safeAddress?: `0x${string}`;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (e: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (e: Error) => void;
}): {
  prepareFn: any;
  writeFn: any;
  waitFn: ReturnType<typeof useWaitForTransaction>;
  allowance: bigint;
  refetchAllowance: () => Promise<any>;
} {
  const MaxUint256 = 2n ** 256n - 1n;
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));
  const approveArgs: [`0x${string}`, bigint] = [spender, amount ?? MaxUint256];
  const allowanceArgs: [`0x${string}`, `0x${string}`] = [owner, spender];
  const isReady: boolean = !!targetAddress && !!owner && !!spender && !!chainId && enabled;

  const prepareFn = usePrepareContractWrite({
    chainId,
    address: targetAddress as `0x${string}`,
    account: owner,
    abi: erc20ABI,
    functionName: "approve",
    args: approveArgs,
    enabled: isReady,
  });

  const writeFn = useSafeContractWrite({
    ...prepareFn.config,
    safeAddress,
    onSuccess(data) {
      onSuccessWrite && onSuccessWrite(data);
    },
    onError(e: Error) {
      onErrorWrite && onErrorWrite(e);
    },
  });

  const waitFn = useSafeWaitForTransaction({
    chainId,
    hash: writeFn.data?.hash,
    safeAddress,
    onSuccess(data) {
      onSuccessConfirm && onSuccessConfirm(data);
    },
    onError(e: Error) {
      onErrorConfirm && onErrorConfirm(e);
    },
  });

  const readFn = useContractRead({
    address: targetAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "allowance",
    args: allowanceArgs,
    enabled,
    onSuccess(data) {
      setAllowance(data);
    },
    watch: true,
  });

  return {
    prepareFn,
    writeFn,
    waitFn,
    allowance,
    refetchAllowance: readFn.refetch,
  };
}

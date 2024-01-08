import {
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
  erc20ABI,
} from "wagmi";
import { useState } from "react";

export default function useApprove({
  targetAddress,
  owner,
  spender,
  amount,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
  enabled,
}: {
  targetAddress: `0x${string}` | null;
  owner: `0x${string}`;
  spender: `0x${string}`;
  amount?: bigint;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (e: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (e: Error) => void;
  enabled: boolean;
}): {
  prepareFn: any;
  writeFn: any;
  waitFn: ReturnType<typeof useWaitForTransaction>;
  allowance: bigint;
  refetchAllowance: () => Promise<any>;
} {
  const MaxUint256 = 2n ** 256n - 1n;
  const { chain } = useNetwork();
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));
  const approveArgs: [`0x${string}`, bigint] = [
    spender,
    amount ? amount : BigInt(MaxUint256.toString()),
  ];
  const allowanceArgs: [`0x${string}`, `0x${string}`] = [owner, spender];
  const isReady: boolean = !!targetAddress && !!owner && !!spender && !!chain && enabled;

  const prepareFn = usePrepareContractWrite({
    chainId: chain?.id,
    address: targetAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "approve",
    args: approveArgs,
    enabled: isReady,
  });

  const writeFn = useContractWrite({
    ...prepareFn.config,
    onSuccess(data) {
      onSuccessWrite && onSuccessWrite(data);
    },
    onError(e: Error) {
      onErrorWrite && onErrorWrite(e);
    },
  });

  const waitFn = useWaitForTransaction({
    chainId: chain?.id,
    hash: writeFn.data?.hash,
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

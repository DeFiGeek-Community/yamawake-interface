import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import VotingEscrowABI from "lib/constants/abis/VotingEscrow.json";
import { LockType } from "lib/types/VotingEscrow";

export default function useLock({
  type,
  value,
  unlockTime,
  allowance,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
}: {
  type: LockType;
  value: Big;
  unlockTime: number | null;
  allowance?: Big;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (error: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (error: Error) => void;
}): {
  writeFn: ReturnType<typeof useContractWrite>;
  waitFn: ReturnType<typeof useWaitForTransaction>;
} {
  const enabled = () => {
    switch (type) {
      case LockType.CREATE_LOCK:
        return (
          value.gt(0) &&
          (!allowance || allowance.gte(value)) &&
          !!unlockTime &&
          unlockTime > new Date().getTime() / 1000
        );
      case LockType.INCREASE_AMOUNT:
        return value.gt(0) && (!allowance || allowance.gte(value));
      case LockType.INCREASE_UNLOCK_TIME:
        return !!unlockTime && unlockTime > new Date().getTime() / 1000;
    }
  };

  const args = () => {
    switch (type) {
      case LockType.CREATE_LOCK:
        return [value.toString(), unlockTime];
      case LockType.INCREASE_AMOUNT:
        return [value.toString()];
      case LockType.INCREASE_UNLOCK_TIME:
        return [unlockTime];
    }
  };

  const config = {
    address: process.env.NEXT_PUBLIC_VE_ADDRESS as `0x${string}`,
    abi: VotingEscrowABI,
    functionName: type.toString(),
    args: args(),
    enabled: enabled(),
  };

  const { config: writeConfig } = usePrepareContractWrite({
    ...config,
  });

  const writeFn = useContractWrite({
    ...writeConfig,
    onSuccess(data) {
      onSuccessWrite && onSuccessWrite(data);
    },
    onError(e: Error) {
      onErrorWrite && onErrorWrite(e);
    },
  });

  const waitFn = useWaitForTransaction({
    hash: writeFn.data?.hash,
    onSuccess(data) {
      onSuccessConfirm && onSuccessConfirm(data);
    },
    onError(e: Error) {
      onErrorConfirm && onErrorConfirm(e);
    },
  });

  return {
    writeFn,
    waitFn,
  };
}

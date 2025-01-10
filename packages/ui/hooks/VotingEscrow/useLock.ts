import { usePrepareContractWrite, useNetwork } from "wagmi";
import { useSafeContractWrite, useSafeWaitForTransaction } from "../Safe";
import VotingEscrowABI from "lib/constants/abis/VotingEscrow.json";
import { LockType } from "lib/types/VotingEscrow";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";

export default function useLock({
  account,
  safeAddress,
  type,
  value,
  unlockTime,
  allowance,
  callbacks,
}: {
  account: `0x${string}` | undefined;
  safeAddress: `0x${string}` | undefined;
  type: LockType;
  value: bigint;
  unlockTime: number | null;
  allowance?: bigint;
  callbacks?: {
    onSuccessWrite?: (data: any) => void;
    onErrorWrite?: (error: Error) => void;
    onSuccessConfirm?: (data: any) => void;
    onErrorConfirm?: (error: Error) => void;
  };
}): {
  writeFn: ReturnType<typeof useSafeContractWrite>;
  waitFn: ReturnType<typeof useSafeWaitForTransaction>;
} {
  const { chain } = useNetwork();
  const enabled = () => {
    switch (type) {
      case LockType.CREATE_LOCK:
        return (
          value > 0 &&
          (!allowance || allowance >= value) &&
          !!unlockTime &&
          unlockTime > new Date().getTime() / 1000
        );
      case LockType.INCREASE_AMOUNT:
        return value > 0 && (!allowance || allowance >= value);
      case LockType.INCREASE_UNLOCK_TIME:
        return !!unlockTime && unlockTime > new Date().getTime() / 1000;
    }
  };

  const args = () => {
    switch (type) {
      case LockType.CREATE_LOCK:
        return [value.toString(), unlockTime || 0];
      case LockType.INCREASE_AMOUNT:
        return [value.toString()];
      case LockType.INCREASE_UNLOCK_TIME:
        return [unlockTime || 0];
    }
  };

  const config = {
    address: chain ? (CONTRACT_ADDRESSES[chain.id].VOTING_ESCROW as `0x${string}`) : "0x",
    abi: VotingEscrowABI,
    account: safeAddress || account,
    functionName: type.toString(),
    args: args(),
    enabled: !!account && !!chain && enabled(),
  };

  const { config: writeConfig } = usePrepareContractWrite({
    ...config,
  });

  const writeFn = useSafeContractWrite({
    ...writeConfig,
    safeAddress,
    onSuccess(data) {
      callbacks?.onSuccessWrite && callbacks?.onSuccessWrite(data);
    },
    onError(e: Error) {
      callbacks?.onErrorWrite && callbacks?.onErrorWrite(e);
    },
  });

  const waitFn = useSafeWaitForTransaction({
    hash: writeFn.data?.hash,
    safeAddress,
    onSuccess(data) {
      callbacks?.onSuccessConfirm && callbacks?.onSuccessConfirm(data);
    },
    onError(e: Error) {
      callbacks?.onErrorConfirm && callbacks?.onErrorConfirm(e);
    },
  });

  return {
    writeFn,
    waitFn,
  };
}

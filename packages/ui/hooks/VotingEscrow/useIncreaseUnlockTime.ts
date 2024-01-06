import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import VotingEscrowABI from "lib/constants/abis/VotingEscrow.json";

export default function useIncreaseUnlockTime({
  unlockTime,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
}: {
  unlockTime: bigint;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (error: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (error: Error) => void;
}): {
  writeFn: ReturnType<typeof useContractWrite>;
  waitFn: ReturnType<typeof useWaitForTransaction>;
} {
  const WEEK = 3600 * 24 * 7;
  const config = {
    address: process.env.NEXT_PUBLIC_MIINTER_ADDRESS as `0x${string}`,
    abi: VotingEscrowABI,
  };
  const { config: claimConfig } = usePrepareContractWrite({
    ...config,
    functionName: "createLock",
    args: [unlockTime],
    enabled:
      // TODO 簡素化
      Math.floor(new Date().getTime() / (1000 * WEEK)) * WEEK > new Date().getTime() / 1000,
  });

  const writeFn = useContractWrite({
    ...claimConfig,
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

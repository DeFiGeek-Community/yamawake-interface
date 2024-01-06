import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import VotingEscrowABI from "lib/constants/abis/VotingEscrow.json";

export default function useCreateLock({
  value,
  unlockTime,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
}: {
  value: Big;
  unlockTime: number | null;
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
    address: process.env.NEXT_PUBLIC_VE_ADDRESS as `0x${string}`,
    abi: VotingEscrowABI,
  };
  const { config: writeConfig } = usePrepareContractWrite({
    ...config,
    functionName: "createLock",
    args: [value.toString(), unlockTime],
    enabled: value.gt(0) && !!unlockTime && unlockTime > new Date().getTime() / 1000,
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

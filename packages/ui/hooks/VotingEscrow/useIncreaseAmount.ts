import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import VotingEscrowABI from "lib/constants/abis/VotingEscrow.json";

export default function useIncreaseAmount({
  value,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
}: {
  value: bigint;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (error: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (error: Error) => void;
}): {
  writeFn: ReturnType<typeof useContractWrite>;
  waitFn: ReturnType<typeof useWaitForTransaction>;
} {
  const config = {
    address: process.env.NEXT_PUBLIC_MIINTER_ADDRESS as `0x${string}`,
    abi: VotingEscrowABI,
  };
  const { config: claimConfig } = usePrepareContractWrite({
    ...config,
    functionName: "increaseAmount",
    args: [value],
    enabled: value > 0,
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

import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import FeeDistributorABI from "lib/constants/abis/FeeDistributor.json";

export default function useClaim({
  address,
  token,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
}: {
  address: `0x${string}`;
  token: `0x${string}`;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (error: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (error: Error) => void;
}): {
  prepareFn: ReturnType<typeof usePrepareContractWrite<typeof FeeDistributorABI, "claim", number>>;
  writeFn: ReturnType<typeof useContractWrite>;
  waitFn: ReturnType<typeof useWaitForTransaction>;
} {
  const config = {
    address: process.env.NEXT_PUBLIC_FEE_DISTRIBUTOR_ADDRESS as `0x${string}`,
    abi: FeeDistributorABI,
  };
  const prepareFn = usePrepareContractWrite({
    ...config,
    functionName: "claim",
    args: [address, token],
    enabled: !!address && !!token,
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
    hash: writeFn.data?.hash,
    onSuccess(data) {
      onSuccessConfirm && onSuccessConfirm(data);
    },
    onError(e: Error) {
      onErrorConfirm && onErrorConfirm(e);
    },
  });

  return {
    prepareFn,
    writeFn,
    waitFn,
  };
}

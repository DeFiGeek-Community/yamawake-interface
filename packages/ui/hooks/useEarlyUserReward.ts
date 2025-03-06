import { useContractRead, usePrepareContractWrite } from "wagmi";
import DistributorABI from "lib/constants/abis/DistributorReceiver.json";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";
import { isSupportedChain } from "lib/utils/chain";
import { useSafeContractWrite, useSafeWaitForTransaction } from "./Safe";

export default function useEarlyUserReward({
  chainId,
  address,
  safeAddress,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
}: {
  chainId: number;
  address: `0x${string}` | undefined;
  safeAddress: `0x${string}` | undefined;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (error: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (error: Error) => void;
}): {
  readFn: ReturnType<typeof useContractRead<typeof DistributorABI, "scores", bigint>>;
  writeFn: ReturnType<typeof useSafeContractWrite>;
  waitFn: ReturnType<typeof useSafeWaitForTransaction>;
} {
  const config = {
    address: CONTRACT_ADDRESSES[chainId]?.DISTRIBUTOR,
    abi: DistributorABI,
    account: safeAddress || address,
  };
  const readFn = useContractRead<typeof DistributorABI, "scores", bigint>({
    ...config,
    functionName: "scores",
    args: [safeAddress || address],
    enabled: isSupportedChain(chainId) && !!address,
  });

  const { config: claimConfig } = usePrepareContractWrite({
    ...config,
    functionName: "claim",
    args: [safeAddress || address],
    enabled: isSupportedChain(chainId) && !!address && !!readFn.data,
  });

  const writeFn = useSafeContractWrite({
    ...claimConfig,
    safeAddress,
    onSuccess(data) {
      onSuccessWrite && onSuccessWrite(data);
    },
    onError(e: Error) {
      onErrorWrite && onErrorWrite(e);
    },
  });

  const waitFn = useSafeWaitForTransaction({
    hash: writeFn.data?.hash,
    safeAddress,
    onSuccess(data) {
      readFn.refetch();
      onSuccessConfirm && onSuccessConfirm(data);
    },
    onError(e: Error) {
      onErrorConfirm && onErrorConfirm(e);
    },
  });

  return {
    readFn,
    writeFn,
    waitFn,
  };
}

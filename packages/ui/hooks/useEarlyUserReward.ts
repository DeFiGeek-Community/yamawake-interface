import {
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import DistributorABI from "lib/constants/abis/Distributor.json";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";
import { isSupportedChain } from "lib/utils/chain";

export default function useEarlyUserReward({
  chainId,
  address,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
}: {
  chainId: number;
  address: `0x${string}` | undefined;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (error: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (error: Error) => void;
}): {
  readFn: ReturnType<typeof useContractRead<typeof DistributorABI, "scores", bigint>>;
  writeFn: ReturnType<typeof useContractWrite>;
  waitFn: ReturnType<typeof useWaitForTransaction>;
} {
  const config = {
    address: CONTRACT_ADDRESSES[chainId]?.DISTRIBUTOR,
    abi: DistributorABI,
  };
  const readFn = useContractRead<typeof DistributorABI, "scores", bigint>({
    ...config,
    functionName: "scores",
    args: [address],
    watch: true,
    enabled: isSupportedChain(chainId) && !!address,
  });

  const { config: claimConfig } = usePrepareContractWrite({
    ...config,
    functionName: "claim",
    args: [address],
    enabled: isSupportedChain(chainId) && !!address && !!readFn.data,
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
    readFn,
    writeFn,
    waitFn,
  };
}

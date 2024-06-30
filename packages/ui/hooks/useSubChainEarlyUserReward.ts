import {
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import DistributorABI from "lib/constants/abis/DistributorSender.json";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";
import { isSupportedChain } from "lib/utils/chain";

export default function useSubChainEarlyUserReward({
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
  readScore: ReturnType<typeof useContractRead<typeof DistributorABI, "scores", bigint>>;
  sendScorePayNative: ReturnType<typeof useContractWrite>;
  waitFn: ReturnType<typeof useWaitForTransaction>;
} {
  const config = {
    address: CONTRACT_ADDRESSES[chainId]?.DISTRIBUTOR,
    abi: DistributorABI,
  };
  const readScore = useContractRead<typeof DistributorABI, "scores", bigint>({
    ...config,
    functionName: "scores",
    args: [address],
    watch: true,
    enabled: isSupportedChain(chainId) && !!address,
  });

  const { config: sendScorePayNativeConfig } = usePrepareContractWrite({
    ...config,
    functionName: "sendScorePayNative",
    args: [address],
    enabled: isSupportedChain(chainId) && !!address && !!readScore.data,
  });

  const sendScorePayNative = useContractWrite({
    ...sendScorePayNativeConfig,
    onSuccess(data) {
      onSuccessWrite && onSuccessWrite(data);
    },
    onError(e: Error) {
      onErrorWrite && onErrorWrite(e);
    },
  });

  const waitFn = useWaitForTransaction({
    hash: sendScorePayNative.data?.hash,
    onSuccess(data) {
      onSuccessConfirm && onSuccessConfirm(data);
    },
    onError(e: Error) {
      onErrorConfirm && onErrorConfirm(e);
    },
  });

  return {
    readScore,
    sendScorePayNative,
    waitFn,
  };
}

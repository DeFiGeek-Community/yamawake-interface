import {
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import DistributorABI from "lib/constants/abis/DistributorSender.json";
import RouterABI from "lib/constants/abis/Router.json";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";
import { isSupportedChain } from "lib/utils/chain";
import { CHAIN_INFO } from "lib/constants/chains";
import { useMemo } from "react";
import { parseAbiParameters, encodeAbiParameters, zeroAddress } from "viem";

export default function useSubChainEarlyUserReward({
  chainId,
  address,
  feeToken,
  shouldClaim,
  onSuccessWrite,
  onErrorWrite,
  onSuccessConfirm,
  onErrorConfirm,
}: {
  chainId: number;
  address: `0x${string}` | undefined;
  feeToken: `0x${string}`;
  shouldClaim: boolean;
  onSuccessWrite?: (data: any) => void;
  onErrorWrite?: (error: Error) => void;
  onSuccessConfirm?: (data: any) => void;
  onErrorConfirm?: (error: Error) => void;
}): {
  readScore: ReturnType<typeof useContractRead<typeof DistributorABI, "scores", bigint>>;
  sendScore: ReturnType<typeof useContractWrite>;
  waitFn: ReturnType<typeof useWaitForTransaction>;
  fee: ReturnType<typeof useContractRead<typeof RouterABI, "getFee", bigint>>;
} {
  const getDistinationChainInfo = useMemo(() => {
    const destinationChainId = CHAIN_INFO[chainId].belongsTo;
    if (!destinationChainId) throw new Error("Destination chain information is incorrect");

    const destinationChain = CHAIN_INFO[destinationChainId];

    if (!destinationChain.chainSelector) throw new Error("Destination chain selector is incorrect");

    const destinationChainDistributor = CONTRACT_ADDRESSES[destinationChainId].DISTRIBUTOR;

    if (!destinationChainDistributor) throw new Error("Destination chain distributor is incorrect");

    return {
      chainSelector: destinationChain.chainSelector,
      destinationChainDistributor,
    };
  }, [chainId]);

  const { chainSelector, destinationChainDistributor } = getDistinationChainInfo;

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

  const routerConfig = {
    address: CONTRACT_ADDRESSES[chainId]?.ROUTER,
    abi: RouterABI,
  };

  const message = {
    receiver: encodeAbiParameters(parseAbiParameters("bytes"), [destinationChainDistributor]),
    data: encodeAbiParameters(parseAbiParameters("address, uint256, bool"), [
      address ?? "0x",
      readScore.data ?? 0n,
      shouldClaim,
    ]),
    tokenAmounts: [],
    extraArgs: "0x",
    feeToken: feeToken,
  };

  const fee = useContractRead<typeof RouterABI, "getFee", bigint>({
    ...routerConfig,
    functionName: "getFee",
    args: [chainSelector, message],
    enabled: isSupportedChain(chainId) && !!address && !!readScore.data,
  });

  const { config: sendScoreConfig } = usePrepareContractWrite({
    ...config,
    functionName: feeToken === zeroAddress ? "sendScorePayNative" : "sendScorePayToken",
    args:
      feeToken === zeroAddress
        ? [chainSelector, destinationChainDistributor, address, shouldClaim]
        : [chainSelector, destinationChainDistributor, address, shouldClaim, feeToken],
    enabled: isSupportedChain(chainId) && !!address && !!readScore.data,
    value: feeToken === zeroAddress ? fee.data : 0n,
  });

  const sendScore = useContractWrite({
    ...sendScoreConfig,
    onSuccess(data) {
      onSuccessWrite && onSuccessWrite(data);
    },
    onError(e: Error) {
      onErrorWrite && onErrorWrite(e);
    },
  });

  const waitFn = useWaitForTransaction({
    hash: sendScore.data?.hash,
    onSuccess(data) {
      onSuccessConfirm && onSuccessConfirm(data);
    },
    onError(e: Error) {
      onErrorConfirm && onErrorConfirm(e);
    },
  });

  return {
    readScore,
    sendScore,
    waitFn,
    fee,
  };
}

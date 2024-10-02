import { erc20ABI, useBalance, useContractRead, usePrepareContractWrite } from "wagmi";
import DistributorABI from "lib/constants/abis/DistributorSender.json";
import RouterABI from "lib/constants/abis/Router.json";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";
import { isSupportedChain } from "lib/utils/chain";
import { CHAIN_INFO } from "lib/constants/chains";
import { useEffect, useMemo, useState } from "react";
import { parseAbiParameters, encodeAbiParameters, zeroAddress, isAddress } from "viem";
import { useSafeContractWrite, useSafeWaitForTransaction } from "./Safe";
import { useIsContractWallet } from "./useIsContractWallet";
import useApprove from "./useApprove";

export default function useSubChainEarlyUserReward({
  chainId,
  address,
  safeAddress,
  destinationAddress,
  feeToken,
  shouldClaim,
  watch = true,
  onSuccessSendScoreWrite,
  onErrorSendScoreWrite,
  onSuccessSendScoreConfirm,
  onErrorSendScoreConfirm,
  onSuccessApproveWrite,
  onErrorApproveWrite,
  onSuccessApproveConfirm,
  onErrorApproveConfirm,
}: {
  chainId: number;
  address: `0x${string}` | undefined;
  safeAddress: `0x${string}` | undefined;
  destinationAddress: `0x${string}` | undefined;
  feeToken: `0x${string}`;
  shouldClaim: boolean;
  watch?: boolean;
  onSuccessSendScoreWrite?: (data: any) => void;
  onErrorSendScoreWrite?: (error: Error) => void;
  onSuccessSendScoreConfirm?: (data: any) => void;
  onErrorSendScoreConfirm?: (error: Error) => void;
  onSuccessApproveWrite?: (data: any) => void;
  onErrorApproveWrite?: (error: Error) => void;
  onSuccessApproveConfirm?: (data: any) => void;
  onErrorApproveConfirm?: (error: Error) => void;
}): {
  approvals: ReturnType<typeof useApprove>;
  readScore: ReturnType<typeof useContractRead<typeof DistributorABI, "scores", bigint>>;
  sendScore: ReturnType<typeof useSafeContractWrite>;
  waitFn: ReturnType<typeof useSafeWaitForTransaction>;
  fee: ReturnType<typeof useContractRead<typeof RouterABI, "getFee", bigint>>;
  ethBalance: ReturnType<typeof useBalance>;
  tokenBalance: ReturnType<typeof useContractRead<typeof erc20ABI, "balanceOf", bigint>>;
  notEnoughBalance: boolean;
  isChekingContractWallet: boolean;
  isContract: boolean;
  isInvalidDestination: boolean;
} {
  const [_destinationAddress, setDestinationAddress] = useState<`0x${string}`>(zeroAddress);
  const [isInvalidDestination, setIsInvalidDestination] = useState<boolean>(false);
  const [notEnoughBalance, setNotEnoughBalance] = useState<boolean>(false);

  const getDistinationChainInfo = useMemo(() => {
    const destinationChainId = CHAIN_INFO[chainId].sourceId;
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

  const { isChecking: isChekingContractWallet, isContract } = useIsContractWallet({
    chainId: chainId,
    address: safeAddress || address,
  });

  const config = {
    address: CONTRACT_ADDRESSES[chainId]?.DISTRIBUTOR,
    abi: DistributorABI,
    account: safeAddress || address,
  };
  const readScore = useContractRead<typeof DistributorABI, "scores", bigint>({
    ...config,
    account: safeAddress || address,
    functionName: "scores",
    args: [safeAddress || address],
    watch,
    enabled: isSupportedChain(chainId) && !!address && !isInvalidDestination,
  });

  const routerConfig = {
    address: CONTRACT_ADDRESSES[chainId]?.ROUTER,
    abi: RouterABI,
  };

  const message = {
    receiver: encodeAbiParameters(parseAbiParameters("bytes"), [destinationChainDistributor]),
    data: encodeAbiParameters(parseAbiParameters("address, uint256, bool"), [
      _destinationAddress,
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
    enabled: isSupportedChain(chainId) && (!!safeAddress || !!address) && !!readScore.data,
  });

  const { config: sendScoreConfig } = usePrepareContractWrite({
    ...config,
    functionName: feeToken === zeroAddress ? "sendScorePayNative" : "sendScorePayToken",
    args:
      feeToken === zeroAddress
        ? [chainSelector, destinationChainDistributor, _destinationAddress, shouldClaim]
        : [chainSelector, destinationChainDistributor, _destinationAddress, shouldClaim, feeToken],
    enabled:
      isSupportedChain(chainId) &&
      (!!safeAddress || !!address) &&
      !isInvalidDestination &&
      !!readScore.data &&
      !notEnoughBalance,
    value: feeToken === zeroAddress ? fee.data : 0n,
  });

  console.log(feeToken, CONTRACT_ADDRESSES[chainId].DISTRIBUTOR);
  const approvals = useApprove({
    chainId,
    targetAddress: feeToken,
    owner: safeAddress || address || "0x",
    spender: CONTRACT_ADDRESSES[chainId].DISTRIBUTOR,
    enabled: (!!safeAddress || !!address) && feeToken !== zeroAddress,
    safeAddress: safeAddress,
    amount: fee.data,
    // amount: fee.data ? fee.data * 2n : undefined, // for accepting fluctuation in fee price
    onSuccessWrite(data) {
      onSuccessApproveWrite && onSuccessApproveWrite(data);
    },
    onErrorWrite(error) {
      onErrorApproveWrite && onErrorApproveWrite(error);
    },
    onSuccessConfirm(data) {
      onSuccessApproveConfirm && onSuccessApproveConfirm(data);
    },
    onErrorConfirm(error) {
      onErrorApproveConfirm && onErrorApproveConfirm(error);
    },
  });

  const sendScore = useSafeContractWrite({
    ...sendScoreConfig,
    safeAddress,
    onSuccess(data) {
      onSuccessSendScoreWrite && onSuccessSendScoreWrite(data);
    },
    onError(e: Error) {
      onErrorSendScoreWrite && onErrorSendScoreWrite(e);
    },
  });

  const waitFn = useSafeWaitForTransaction({
    hash: sendScore.data?.hash,
    safeAddress,
    onSuccess(data) {
      onSuccessSendScoreConfirm && onSuccessSendScoreConfirm(data);
    },
    onError(e: Error) {
      onErrorSendScoreConfirm && onErrorSendScoreConfirm(e);
    },
  });

  const ethBalance = useBalance({
    chainId,
    address: safeAddress || address,
    enabled: !!safeAddress || !!address,
  });

  const tokenBalance = useContractRead<typeof erc20ABI, "balanceOf", bigint>({
    address: feeToken,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [safeAddress || address || "0x"],
    watch: true,
    enabled: (!!safeAddress || !!address) && feeToken !== zeroAddress,
  });

  useEffect(() => {
    let isInvalid = false;
    let dest: `0x${string}` = zeroAddress;
    if (safeAddress) {
      isInvalid = !destinationAddress || !isAddress(destinationAddress);
      if (!isInvalid) dest = destinationAddress!;
    } else {
      dest = address ?? zeroAddress;
    }
    setIsInvalidDestination(isInvalid);
    setDestinationAddress(dest);
  }, [address, safeAddress, destinationAddress]);

  useEffect(() => {
    setNotEnoughBalance(
      (feeToken !== zeroAddress &&
        typeof fee.data === "bigint" &&
        typeof tokenBalance.data === "bigint" &&
        fee.data > tokenBalance.data) ||
        (feeToken === zeroAddress &&
          typeof fee.data === "bigint" &&
          typeof ethBalance.data?.value === "bigint" &&
          fee.data > ethBalance.data.value),
    );
  }, [feeToken, fee.data, tokenBalance.data, ethBalance.data]);

  return {
    approvals,
    readScore,
    sendScore,
    waitFn,
    fee,
    ethBalance,
    tokenBalance,
    notEnoughBalance,
    isChekingContractWallet,
    isContract,
    isInvalidDestination,
  };
}

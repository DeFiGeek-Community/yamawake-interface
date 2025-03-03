import { useContractRead, useNetwork, usePrepareContractWrite } from "wagmi";
import RewardGaugeABI from "lib/constants/abis/RewardGauge.json";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";

export default function useClaimableTokens({
  account,
  safeAddress,
}: {
  account: `0x${string}` | undefined;
  safeAddress: `0x${string}` | undefined;
}): {
  readFn: ReturnType<typeof useContractRead<typeof RewardGaugeABI, "claimableTokens", bigint>>;
  prepareFn: ReturnType<
    typeof usePrepareContractWrite<typeof RewardGaugeABI, "claimableTokens", number>
  >;
} {
  const { chain } = useNetwork();
  const config = {
    address: chain ? CONTRACT_ADDRESSES[chain.id].REWARD_GAUGE : "0x",
    abi: RewardGaugeABI,
    args: [safeAddress || account],
    enabled: !!account,
  };
  const prepareFn = usePrepareContractWrite({
    ...config,
    functionName: "claimableTokens",
  });
  const readFn = useContractRead<typeof RewardGaugeABI, "claimableTokens", bigint>({
    ...config,
    functionName: "claimableTokens",
  });

  return {
    readFn,
    prepareFn,
  };
}

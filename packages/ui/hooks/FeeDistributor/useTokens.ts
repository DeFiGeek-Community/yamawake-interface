import { useContractRead, useNetwork } from "wagmi";
import FeeDistributorABI from "lib/constants/abis/FeeDistributor.json";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";

export default function useTokens(): {
  readFn: ReturnType<
    typeof useContractRead<typeof FeeDistributorABI, "balanceOf", [`0x${string}`]>
  >;
} {
  const { chain } = useNetwork();
  const config = {
    address: chain ? CONTRACT_ADDRESSES[chain.id].FEE_DISTRIBUTOR : "0x",
    abi: FeeDistributorABI,
  };
  const readFn = useContractRead<typeof FeeDistributorABI, "getTokens", [`0x${string}`]>({
    ...config,
    functionName: "getTokens",
    args: [],
    enabled: !!chain,
  });

  return {
    readFn,
  };
}

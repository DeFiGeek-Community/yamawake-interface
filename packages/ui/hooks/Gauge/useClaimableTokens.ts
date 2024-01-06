import { useContractRead, usePrepareContractWrite } from "wagmi";
import GaugeABI from "lib/constants/abis/Gauge.json";

export default function useClaimableTokens(address?: `0x${string}`): {
  readFn: ReturnType<typeof useContractRead<typeof GaugeABI, "claimableTokens", bigint>>;
  prepareFn: ReturnType<typeof usePrepareContractWrite<typeof GaugeABI, "claimableTokens", number>>;
} {
  const config = {
    address: process.env.NEXT_PUBLIC_GAUGE_ADDRESS as `0x${string}`,
    abi: GaugeABI,
  };
  const readFn = useContractRead<typeof GaugeABI, "claimableTokens", bigint>({
    ...config,
    functionName: "claimableTokens",
    args: [address],
    enabled: !!address,
  });

  const prepareFn = usePrepareContractWrite({
    ...config,
    functionName: "claimableTokens",
    args: [address],
    enabled: !!address,
  });

  return {
    readFn,
    prepareFn,
  };
}

import { useContractRead } from "wagmi";
import { CHAINLINK_PRICE_FEED } from "lib/constants";
import PriceFeedABI from "lib/constants/abis/ChainlinkPriceFeed.json";

const useRate = (
  chainId: number | null,
  pair: "ETH-USD" = "ETH-USD",
): ReturnType<
  typeof useContractRead<typeof PriceFeedABI, "latestRoundData", number | undefined>
> => {
  const contractRead = useContractRead<typeof PriceFeedABI, "latestRoundData", number | undefined>({
    address: chainId ? (CHAINLINK_PRICE_FEED[pair][chainId] as `0x${string}`) : "0x00",
    abi: PriceFeedABI,
    functionName: "latestRoundData",
    enabled: !!chainId,
    scopeKey: pair,
    cacheTime: 60_000,
    staleTime: 60_000,
    select: (data): number | undefined => {
      const result = data as (bigint | number)[];
      return typeof result[1] === "bigint" ? Number(result[1]) / 1e8 : undefined;
    },
  });
  return contractRead;
};
export default useRate;

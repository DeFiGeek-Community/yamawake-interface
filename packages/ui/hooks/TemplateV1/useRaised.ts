import { useContractReads } from "wagmi";
import TemplateV1ABI from "lib/constants/abis/TemplateV1.json";
import Big, { getBigNumber } from "lib/utils/bignumber";
import { TemplateV1 } from "lib/types/Auction";
import { ContractFunctionConfig, Abi } from "viem";

export default function useRaised(
  auction: TemplateV1,
  address: `0x${string}` | undefined,
): {
  raised: Big;
  totalRaised: Big;
  isLoading: boolean;
  isError: boolean;
  refetch: (() => Promise<any>) | (() => void);
} {
  const auctionContractConfig = {
    address: auction.id as `0x${string}`,
    abi: TemplateV1ABI as Abi,
  };

  const { data, isError, status, refetch, isLoading } = useContractReads<
    ContractFunctionConfig<Abi, string>[],
    boolean,
    any
  >({
    contracts: [
      {
        ...auctionContractConfig,
        functionName: "raised",
        // TODO Specify Type
        // @ts-ignore
        args: [address],
      },
      {
        ...auctionContractConfig,
        functionName: "totalRaised",
      },
    ],
    allowFailure: false,
    enabled: typeof address !== "undefined",
  });

  /*
  To reduce RPC request, it returns 0 raised and totalRaised from Auction object if address is not given.
  */
  if (typeof address === "undefined") {
    return {
      raised: Big(0),
      totalRaised: getBigNumber(auction.totalRaised[0].amount),
      isLoading: false,
      isError: false,
      refetch: () => {},
    };
  }

  return {
    raised: data && data[0] ? getBigNumber(BigInt(data[0]).toString()) : Big(0),
    totalRaised: data && data[1] ? getBigNumber(BigInt(data[1]).toString()) : Big(0),
    isLoading,
    isError,
    refetch,
  };
}

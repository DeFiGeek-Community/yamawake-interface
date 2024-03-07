import useSWR, { SWRResponse } from "swr";
import { zeroAddress } from "viem";
import client from "lib/graphql/client";
import { GET_SALE_QUERY } from "lib/graphql/query";
import { BaseAuction } from "lib/types/Auction";

type QueryResponse = {
  auction: BaseAuction;
};

const useAuction = (
  id: `0x${string}`,
  address: `0x${string}` = zeroAddress,
): SWRResponse<any | undefined, Error> => {
  const params = new URLSearchParams({
    address,
  }).toString();

  const fetcher = async (key: string): Promise<any | undefined> => {
    const result = await client.request<QueryResponse>(GET_SALE_QUERY, {
      id: id as string,
      address: (address as `0x${string}`).toLowerCase(),
    });
    return { auction: result.auction };
  };

  return useSWR<any | undefined, Error>(`/api/auctions/${id}?${params}`, fetcher, {
    errorRetryCount: 5,
  });
};

export default useAuction;

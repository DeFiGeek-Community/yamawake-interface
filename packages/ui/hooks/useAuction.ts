import useSWR, { SWRResponse } from "swr";
import { zeroAddress } from "viem";
import { GET_SALE_QUERY } from "lib/graphql/query";
import { BaseAuction } from "lib/types/Auction";
import { GraphQLChainClient } from "lib/graphql/client";
import { GraphQLClient } from "graphql-request";

type QueryResponse = {
  auction: BaseAuction;
};

type Variable = { address: string; id: string };

const useAuction = (
  id: `0x${string}`,
  address: `0x${string}` = zeroAddress,
  chainId: number | undefined,
): SWRResponse<any | undefined, Error> => {
  const params = new URLSearchParams({
    address,
  }).toString();

  let client = new GraphQLChainClient({ chainId });

  const fetcher = async (key: string): Promise<any | undefined> => {
    let result: QueryResponse | Error;
    const variables: Variable = {
      id: id as string,
      address: (address as `0x${string}`).toLowerCase(),
    };

    result = await handleFetch(client, GET_SALE_QUERY, variables);
    if (result instanceof Error) {
      client = new GraphQLChainClient({ chainId, useSecondaryEndpoint: true });
      result = await handleFetch(client, GET_SALE_QUERY, variables);
      if (result instanceof Error) throw result;
    }

    return result;
  };

  const handleFetch = async (
    client: GraphQLClient,
    query: string,
    variables: Variable,
  ): Promise<QueryResponse | Error> => {
    try {
      const result = await client.request<QueryResponse>(query, variables);
      return result;
    } catch (e: unknown) {
      if (e instanceof Error) {
        return e;
      }
      return new Error("An error occurred");
    }
  };

  return useSWR<any | undefined, Error>(`/api/auctions/${chainId}/${id}?${params}`, fetcher, {
    errorRetryCount: 5,
  });
};

export default useAuction;

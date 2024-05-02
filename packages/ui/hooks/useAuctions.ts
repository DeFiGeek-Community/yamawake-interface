import { KeyedMutator, SWRConfiguration } from "swr";
import useSWRInfinite from "swr/infinite";
import {
  QueryType,
  LIST_ACTIVE_AND_UPCOMING_SALE_QUERY,
  LIST_ACTIVE_SALE_QUERY,
  LIST_UPCOMING_SALE_QUERY,
  LIST_CLOSED_SALE_QUERY,
  LIST_MY_SALE_QUERY,
  LIST_PARTICIPATED_SALE_QUERY,
} from "lib/graphql/query";
import { AuctionProps, BaseAuction } from "lib/types/Auction";
import { zeroAddress } from "viem";
import { GraphQLChainClient } from "lib/graphql/client";
import { GraphQLClient } from "graphql-request";

interface SWRAuctionStore {
  auctions: AuctionProps[];
  isLast: boolean;
  error?: Error;
  isLoading: boolean;
  isValidating: boolean;
  loadMoreAuctions: () => void;
  mutate: KeyedMutator<AuctionProps[][]>;
}

type QueryResponse = {
  auctions: BaseAuction[];
};

type AuctionsParams = {
  first?: number;
  skip?: number;
  id?: `0x${string}`;
  keySuffix?: string;
};

type Variable = { skip: number; first: number; now: number; id: string };

// TODO Send limit as a param
const LIMIT = 50;
const NOW = Math.floor(new Date().getTime() / 1000);

export const useSWRAuctions = (
  config: AuctionsParams & SWRConfiguration,
  queryType: QueryType = QueryType.ACTIVE_AND_UPCOMING,
  chainId: number | undefined,
): SWRAuctionStore => {
  let client = new GraphQLChainClient({ chainId });
  const getQuery = (queryType: QueryType): string => {
    switch (queryType) {
      case QueryType.ACTIVE_AND_UPCOMING:
        return LIST_ACTIVE_AND_UPCOMING_SALE_QUERY;
      case QueryType.ACTIVE:
        return LIST_ACTIVE_SALE_QUERY;
      case QueryType.UPCOMING:
        return LIST_UPCOMING_SALE_QUERY;
      case QueryType.CLOSED:
        return LIST_CLOSED_SALE_QUERY;
      case QueryType.MY_SALE_QUERY:
        return LIST_MY_SALE_QUERY;
      case QueryType.PARTICIPATED_SALE_QUERY:
        return LIST_PARTICIPATED_SALE_QUERY;
      default:
        return LIST_ACTIVE_AND_UPCOMING_SALE_QUERY;
    }
  };
  const getKey = (pageIndex: number, previousPageData: AuctionProps[]) => {
    if (previousPageData && !previousPageData.length) return null;
    let skip = pageIndex * LIMIT;
    skip = config.skip ? config.skip + skip : skip;
    const query = getQuery(queryType);
    const first = config.first ? config.first : LIMIT;
    const id = config.id ? config.id : zeroAddress;
    const now = NOW;

    return { query, variables: { skip, first, now, id, chainId } };
  };

  const fetcher = async (
    params: {
      query: string;
      variables: Variable;
    } | null,
  ) => {
    if (params === null) return [];
    let result: AuctionProps[] | Error;

    result = await handleFetch(client, params.query, params.variables);
    if (result instanceof Error) {
      client = new GraphQLChainClient({ chainId, useSecondaryEndpoint: true });
      result = await handleFetch(client, params.query, params.variables);
      if (result instanceof Error) throw result;
    }

    return result;
  };

  const handleFetch = async (
    client: GraphQLClient,
    query: string,
    variables: Variable,
  ): Promise<AuctionProps[] | Error> => {
    try {
      const result = await client.request<QueryResponse>(query, variables);
      return result.auctions;
    } catch (e: unknown) {
      if (e instanceof Error) {
        return e;
      }
      return new Error("An error occurred");
    }
  };

  const {
    data: auctionList,
    error,
    size,
    setSize,
    isLoading,
    isValidating,
    mutate,
  } = useSWRInfinite<AuctionProps[], Error>(getKey, fetcher, config);

  const loadMoreAuctions = () => {
    setSize(size + 1);
  };

  const isLast = auctionList ? auctionList.filter((list) => list.length < LIMIT).length > 0 : false;
  const auctions = auctionList ? auctionList.flat() : [];

  return {
    auctions,
    isLast,
    error,
    isLoading,
    isValidating,
    loadMoreAuctions,
    mutate,
  };
};

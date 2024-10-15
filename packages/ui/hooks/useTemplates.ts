import useSWR, { SWRResponse } from "swr";
import { LIST_TEMPLATE_QUERY } from "lib/graphql/query";
import { Template } from "lib/types/Auction";
import { GraphQLChainClient } from "lib/graphql/client";
import { GraphQLClient } from "graphql-request";

type QueryResponse = {
  templates: Template;
};

const useTemplates = (chainId: number | undefined): SWRResponse<any | undefined, Error> => {
  let client = new GraphQLChainClient({ chainId });
  let result: QueryResponse | Error;
  const fetcher = async (key: string): Promise<any | undefined> => {
    result = await handleFetch(client);
    if (result instanceof Error) {
      client = new GraphQLChainClient({ chainId, useSecondaryEndpoint: true });
      result = await handleFetch(client);
      if (result instanceof Error) throw result;
    }
    return result;
  };

  return useSWR<any | undefined, Error>(`/api/${chainId}/templates`, fetcher, {
    errorRetryCount: 2,
  });
};

const handleFetch = async (client: GraphQLClient): Promise<QueryResponse | Error> => {
  try {
    const result = await client.request<QueryResponse>(LIST_TEMPLATE_QUERY);
    return result;
  } catch (e: unknown) {
    if (e instanceof Error) {
      return e;
    }
    return new Error("An error occurred");
  }
};

export default useTemplates;

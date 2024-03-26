import useSWR, { SWRResponse } from "swr";
import { LIST_TEMPLATE_QUERY } from "lib/graphql/query";
import { Template } from "lib/types/Auction";
import { GraphQLChainClient } from "lib/graphql/client";

type QueryResponse = {
  templates: Template;
};

const useTemplates = (chainId?: number): SWRResponse<any | undefined, Error> => {
  const client = new GraphQLChainClient({ chainId });
  const fetcher = async (key: string): Promise<any | undefined> => {
    const result = await client.request<QueryResponse>(LIST_TEMPLATE_QUERY);
    return { templates: result.templates };
  };

  return useSWR<any | undefined, Error>(`/api/${chainId}/templates`, fetcher, {
    errorRetryCount: 2,
  });
};

export default useTemplates;

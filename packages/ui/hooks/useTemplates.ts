import useSWR, { SWRResponse } from "swr";
import { LIST_TEMPLATE_QUERY } from "lib/graphql/query";
import { Template } from "lib/types/Auction";
import { useContext } from "react";
import GraphqlClientContext from "../contexts/GraphqlClientContext";

type QueryResponse = {
  templates: Template;
};

const useTemplates = (): SWRResponse<any | undefined, Error> => {
  const { client } = useContext(GraphqlClientContext);
  const fetcher = async (key: string): Promise<any | undefined> => {
    const result = await client.request<QueryResponse>(LIST_TEMPLATE_QUERY);
    return { templates: result.templates };
  };

  return useSWR<any | undefined, Error>(`/api/templates`, fetcher, {
    errorRetryCount: 2,
  });
};

export default useTemplates;

import { createContext } from "react";
import { GraphQLClient } from "graphql-request";
import { getChain } from "lib/utils/chain";
import { SUBGRAPH_ENDPOINTS } from "lib/constants/subgraphEndpoints";

export type GraphqlClientContextType = {
  client: GraphQLClient;
};

const GraphqlClientContext = createContext<GraphqlClientContextType>({
  client: new GraphQLClient(
    SUBGRAPH_ENDPOINTS[Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID!)],
    {},
  ),
});
export default GraphqlClientContext;

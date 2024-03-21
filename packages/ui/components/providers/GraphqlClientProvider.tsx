import { useNetwork } from "wagmi";
import GraphqlClientContext from "../../contexts/GraphqlClientContext";
import { GraphQLClient } from "graphql-request";
import { useEffect, useState } from "react";
import { SUBGRAPH_ENDPOINTS } from "lib/constants/subgraphEndpoints";

export const GraphqlClientProvider = (props: any) => {
  const { chain } = useNetwork();
  const [client, setClient] = useState<GraphQLClient>(
    new GraphQLClient(SUBGRAPH_ENDPOINTS[Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID!)], {}),
  );
  useEffect(() => {
    if (typeof chain !== "undefined") {
      setClient(new GraphQLClient(SUBGRAPH_ENDPOINTS[chain.id], {}));
    }
  }, [chain]);

  return (
    <GraphqlClientContext.Provider value={{ client }}>
      {props.children}
    </GraphqlClientContext.Provider>
  );
};

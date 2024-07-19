import { GraphQLClient } from "graphql-request";
import type { RequestConfig } from "graphql-request/build/esm/types";
import { Chain } from "viem/chains";
import { SUBGRAPH_ENDPOINTS, SUBGRAPH_SECONDARY_ENDPOINTS } from "../constants/subgraphEndpoints";
import { getDefaultChain, getSupportedChain } from "../utils/chain";

export class GraphQLChainClient extends GraphQLClient {
  constructor({
    chainId,
    requestConfig,
    useSecondaryEndpoint = false,
  }: {
    chainId?: number;
    requestConfig?: RequestConfig;
    useSecondaryEndpoint?: boolean;
  }) {
    let requestedChain: Chain | undefined;
    let endpoint: string | undefined = useSecondaryEndpoint
      ? SUBGRAPH_SECONDARY_ENDPOINTS[getDefaultChain().id]
      : SUBGRAPH_ENDPOINTS[getDefaultChain().id];

    if (typeof chainId !== "undefined") {
      requestedChain = getSupportedChain(chainId);
    }

    if (requestedChain)
      endpoint = useSecondaryEndpoint
        ? SUBGRAPH_SECONDARY_ENDPOINTS[requestedChain.id]
        : SUBGRAPH_ENDPOINTS[requestedChain.id];

    console.log("---");
    console.log(endpoint);
    console.log(
      useSecondaryEndpoint,
      getDefaultChain().id,
      requestedChain?.id,
      SUBGRAPH_ENDPOINTS,
      SUBGRAPH_SECONDARY_ENDPOINTS,
      SUBGRAPH_SECONDARY_ENDPOINTS[getDefaultChain().id],
      SUBGRAPH_ENDPOINTS[getDefaultChain().id],
    );
    console.log("---");

    if (typeof endpoint === "undefined") throw new Error("Subgraph endpoint is not set correctly");
    super(endpoint, requestConfig);
  }
}

import { ClientError, GraphQLClient } from "graphql-request";
import type { RequestConfig, ResponseMiddleware } from "graphql-request/build/esm/types";
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
    let endpoint: string = useSecondaryEndpoint
      ? SUBGRAPH_SECONDARY_ENDPOINTS[getDefaultChain().id]
      : SUBGRAPH_ENDPOINTS[getDefaultChain().id];

    if (typeof chainId !== "undefined") {
      requestedChain = getSupportedChain(chainId);
    }
    if (requestedChain)
      endpoint = useSecondaryEndpoint
        ? SUBGRAPH_SECONDARY_ENDPOINTS[requestedChain.id]
        : SUBGRAPH_ENDPOINTS[requestedChain.id];
    super(endpoint, requestConfig);
  }
}

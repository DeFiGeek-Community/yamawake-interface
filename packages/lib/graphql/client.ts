import { GraphQLClient } from "graphql-request";
import { RequestConfig } from "graphql-request/build/esm/types";
import { Chain } from "viem/chains";
import { SUBGRAPH_ENDPOINTS } from "../constants/subgraphEndpoints";
import { getDefaultChain, getSupportedChain } from "../utils/chain";

export class GraphQLChainClient extends GraphQLClient {
  constructor({ chainId, requestConfig }: { chainId?: number; requestConfig?: RequestConfig }) {
    let requestedChain: Chain | undefined;
    let endpoint: string = SUBGRAPH_ENDPOINTS[getDefaultChain().id];

    if (typeof chainId !== "undefined") {
      requestedChain = getSupportedChain(chainId);
    }
    if (requestedChain) endpoint = SUBGRAPH_ENDPOINTS[requestedChain.id];
    super(endpoint, requestConfig);
  }
}

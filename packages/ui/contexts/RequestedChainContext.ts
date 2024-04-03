import { createContext } from "react";
import { Chain } from "viem/chains";
import { ChainConfig, ChainConstants, ChainFormatters } from "viem/_types/types/chain";
import { getDefaultChain } from "lib/utils/chain";

export type RequestedChainContextType = {
  connectedChain:
    | (ChainConstants &
        ChainConfig<ChainFormatters | undefined> & {
          unsupported?: boolean | undefined;
        })
    | undefined; // Connected chain
  requestedChain: Chain; // requested chain object derived from chainId in URL
};

const RequestedChainContext = createContext<RequestedChainContextType>({
  connectedChain: undefined,
  requestedChain: getDefaultChain(),
});

export default RequestedChainContext;

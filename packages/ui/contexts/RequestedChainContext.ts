import { createContext } from "react";
import { Chain } from "viem/chains";
import { getDefaultChain } from "lib/utils/chain";

export type RequestedChainContextType = {
  connectedChain: Chain | undefined; // Connected chain
  chainId: number | undefined; //chainId derived from URL
  requestedChain: Chain; // requested chain object derived from chainId in URL
};

const RequestedChainContext = createContext<RequestedChainContextType>({
  connectedChain: undefined,
  chainId: undefined,
  requestedChain: getDefaultChain(),
});

export default RequestedChainContext;

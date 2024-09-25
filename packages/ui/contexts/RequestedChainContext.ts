import { createContext } from "react";
import { Chain } from "viem/chains";
import { useNetwork } from "wagmi";
import { getDefaultChain } from "lib/utils/chain";

export type RequestedChainContextType = {
  connectedChain: ReturnType<typeof useNetwork>["chain"]; // Connected chain
  requestedChain: Chain; // requested chain object derived from chainId in URL
  falledBack: boolean; // falled back to the default chain or not
};

const RequestedChainContext = createContext<RequestedChainContextType>({
  connectedChain: undefined,
  requestedChain: getDefaultChain(),
  falledBack: false,
});

export default RequestedChainContext;

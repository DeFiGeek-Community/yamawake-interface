import { createContext } from "react";
import { Chain } from "viem/chains";
import { getDefaultChain } from "lib/utils/chain";

export type RequestedChainContextType = {
  requestedChain: Chain;
};

const RequestedChainContext = createContext<RequestedChainContextType>({
  requestedChain: getDefaultChain(),
});
export default RequestedChainContext;

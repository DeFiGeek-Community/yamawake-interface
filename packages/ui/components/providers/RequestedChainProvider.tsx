import { FC, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Chain } from "viem/chains";
import { useNetwork } from "wagmi";
import { getDefaultChain, getSupportedChain } from "lib/utils/chain";
import RequestedChainContext from "../../contexts/RequestedChainContext";

export const RequestedChainProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { chain } = useNetwork();
  const router = useRouter();
  const { chainId } = router.query;
  const [requestedChain, setRequestedChain] = useState<Chain>(getDefaultChain());
  const [falledBack, setFalledback] = useState<boolean>(false);

  useEffect(() => {
    let toChain: Chain | undefined;
    if (typeof chainId === "string") {
      toChain = getSupportedChain(chainId);
    } else if (chain) {
      toChain = chain;
    }
    if (toChain) {
      setRequestedChain(toChain);
      setFalledback(false);
    } else if (chain) {
      // Connected to unknown chain
      setRequestedChain(getDefaultChain());
      setFalledback(true);
    }
  }, [chain, chainId]);

  return (
    <RequestedChainContext.Provider
      value={{
        connectedChain: chain,
        requestedChain,
        falledBack,
      }}
    >
      {children}
    </RequestedChainContext.Provider>
  );
};

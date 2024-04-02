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

  useEffect(() => {
    let toChain: Chain | undefined;
    if (chain) {
      toChain = chain;
    } else if (typeof chainId === "string") {
      toChain = getSupportedChain(chainId);
    }
    if (toChain) setRequestedChain(toChain);
  }, [chain, chainId]);

  return (
    <RequestedChainContext.Provider
      value={{
        connectedChain: chain,
        chainId: typeof chainId === "string" ? Number(chainId) : undefined,
        requestedChain,
      }}
    >
      {children}
    </RequestedChainContext.Provider>
  );
};

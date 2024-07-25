// Forked from https://github.com/moleculeprotocol/test-wagmi-safe-privy
import { useEffect, useState } from "react";
import { Address } from "viem";
import { usePublicClient } from "wagmi";
import { isContractWallet } from "lib/utils/safe";

export const useIsContractWallet = ({
  chainId,
  address,
}: {
  chainId: number | undefined;
  address: Address | undefined;
}) => {
  const publicClient = usePublicClient({ chainId });
  const [_isContractWallet, setIsContractWallet] = useState<
    Awaited<ReturnType<typeof isContractWallet>>
  >({});

  useEffect(() => {
    if (!address || !publicClient) return;

    isContractWallet(publicClient, address).then(setIsContractWallet);
  }, [address, publicClient]);

  return _isContractWallet;
};

/* try to check whether our connector *can* actually be a safe,  this is privy specific,
    // if (!activeWallet.connectorType.startsWith("wallet_connect")) {
    //   setIsSafeWallet(false);
    //   return;
    // }
*/

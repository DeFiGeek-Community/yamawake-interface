import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import RequestedChainContext, {
  RequestedChainContextType,
} from "../contexts/RequestedChainContext";
import { useCurrentUser } from "./Auth/useCurrentUser";

export const useRequestedChain = ({
  redirectOnSwitchNetwork = false,
}: {
  redirectOnSwitchNetwork?: boolean;
} = {}): RequestedChainContextType => {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const { requestedChain, connectedChain: chain, falledBack } = useContext(RequestedChainContext);
  useEffect(() => {
    // No SIWE, and network change detected
    // Redirect to the correct URL based on where a user is now
    if (redirectOnSwitchNetwork && !currentUser && chain && chain.id !== requestedChain.id) {
      router.push(router.asPath.replace(requestedChain.id.toString(), chain.id.toString()));
    }
  }, [chain]);
  return { requestedChain, connectedChain: chain, falledBack };
};

import { FC, ReactNode, useEffect } from "react";
import { useAccount, useDisconnect, useNetwork } from "wagmi";
import { useToast } from "@chakra-ui/react";
import { useCurrentUser } from "../../hooks/Auth/useCurrentUser";
import CurrentUserContext from "../../contexts/CurrentUserContext";

export const CurrentUserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();
  const { data, mutate, error } = useCurrentUser();
  const toast = useToast({ position: "top-right", isClosable: true });
  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    disconnect();
    mutate && mutate();
  };

  // Detect account change and sign out if SIWE user and account does not match
  useEffect(() => {
    if (data && (data.address != address || (chain && data.chainId != chain.id))) {
      logout();
      !toast.isActive("signout") &&
        !toast.isActive("accountChanged") &&
        toast({
          id: "accountChanged",
          description: "Connection change detected. Signed out.",
          status: "info",
          duration: 5000,
        });
    }
  }, [address, chain]);

  return (
    <CurrentUserContext.Provider value={{ currentUser: data, mutate, error }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

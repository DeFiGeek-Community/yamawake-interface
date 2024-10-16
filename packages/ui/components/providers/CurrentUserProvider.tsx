import { FC, ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount, useDisconnect, useNetwork } from "wagmi";
import { useToast } from "@chakra-ui/react";
import type { SignInParams } from "lib/types";
import { getLinkPath } from "lib/utils";
import { useCurrentUser } from "../../hooks/Auth/useCurrentUser";
import { useSIWE } from "../../hooks/Auth/useSIWE";
import { useLocale } from "../../hooks/useLocale";
import CurrentUserContext from "../../contexts/CurrentUserContext";

export const CurrentUserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();
  const { data, mutate, error } = useCurrentUser();
  const { loading, signIn, error: signInError } = useSIWE();
  const { t } = useLocale();
  const router = useRouter();
  const toast = useToast({ position: "top-right", isClosable: true });
  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    disconnect();
    mutate && mutate();

    !toast.isActive("signout") &&
      !toast.isActive("accountChanged") &&
      toast({
        id: "accountChanged",
        description: t("CONNECTION_CHANGE_DETECTED"),
        status: "info",
        duration: 5000,
      });
  };

  const processSignIn = async (params: SignInParams, redirect: boolean) => {
    await signIn(params);
    if (redirect) {
      router.push(getLinkPath(router.asPath, params.chainId));
    }
  };

  useEffect(() => {
    if (signInError) logout();
  }, [signInError]);

  // Detect account change and sign out if SIWE user and account does not match
  useEffect(() => {
    if (!data) return;

    if (!address || (chain && data.chainId != chain.id && data.safeAccount)) {
      // Force sign out if the connection is missing or signed in with Safe account
      logout();
    } else if (chain && (data.address != address || data.chainId != chain.id)) {
      processSignIn(
        {
          title: t("SIGN_IN_WITH_ETHEREUM"),
          targetAddress: address,
          chainId: chain.id,
        },
        data.chainId != chain.id,
      );
    }
  }, [address, chain, data]);

  return (
    <CurrentUserContext.Provider value={{ currentUser: data, mutate, error }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

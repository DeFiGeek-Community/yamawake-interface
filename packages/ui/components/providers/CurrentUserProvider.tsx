import { FC, ReactNode, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useToast } from "@chakra-ui/react";
import type { SignInParams } from "lib/types";
import { getLinkPath } from "lib/utils";
import { useCurrentUser } from "../../hooks/Auth/useCurrentUser";
import { useSIWE } from "../../hooks/Auth/useSIWE";
import { useLocale } from "../../hooks/useLocale";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import { useRouter } from "next/router";

export const CurrentUserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data, mutate, error } = useCurrentUser();
  const { loading, signIn } = useSIWE();
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
    try {
      await signIn(params);
      if (redirect) {
        router.push(getLinkPath(router.asPath, params.chainId));
      }
    } catch (e) {
      await logout();
    }
  };

  // Detect account change and sign out if SIWE user and account does not match
  useEffect(() => {
    if (!data) return;

    if (!address) {
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

import { useContext, useEffect } from "react";
import { chakra, Alert, AlertIcon, useColorMode, useToast } from "@chakra-ui/react";
import { useAccount, useDisconnect, useNetwork } from "wagmi";
import { getSupportedChain } from "lib/utils/chain";
import { useIsMounted } from "../../hooks/useIsMounted";
import { useLocale } from "../../hooks/useLocale";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ title, children }: { title?: string; children: React.ReactNode }) {
  const isMounted = useIsMounted();
  const { chain } = useNetwork();
  const { currentUser, mutate } = useContext(CurrentUserContext);
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const toast = useToast({ position: "top-right", isClosable: true });
  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    disconnect();
    mutate && mutate();
  };
  const { t } = useLocale();

  // Detect account change and sign out if SIWE user and account does not match
  // TODO
  // This should be done in current user provider -->
  useEffect(() => {
    if (
      currentUser &&
      (currentUser.address != address || (chain && currentUser.chainId != chain.id))
    ) {
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
  // <--

  // Dark mode only for now
  const { colorMode, toggleColorMode } = useColorMode();
  useEffect(() => {
    if (colorMode === "light") toggleColorMode();
  }, [colorMode]);

  // To avoid hydration issues
  // https://github.com/wagmi-dev/wagmi/issues/542#issuecomment-1144178142
  if (!isMounted) return null;

  return (
    <>
      <Header title={title ? title : "Yamawake"} />
      {chain && chain.unsupported && (
        <chakra.div px={{ base: 0, md: 8 }} mt={1} position={"absolute"} w={"full"} zIndex={"10"}>
          <Alert status="warning" mb={4}>
            <AlertIcon />{" "}
            {t("PLEASE_CONNECT_TO", {
              network: getSupportedChain(Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID))!.name,
            })}
          </Alert>
        </chakra.div>
      )}
      <chakra.div bg={"gray.800"}>{children}</chakra.div>
      <Footer />
    </>
  );
}

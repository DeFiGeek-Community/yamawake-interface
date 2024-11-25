import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { OpenPanelComponent } from "@openpanel/nextjs";
import { chakra, Alert, AlertIcon, useColorMode } from "@chakra-ui/react";
import { useLocale } from "../../hooks/useLocale";
import { useRequestedChain } from "../../hooks/useRequestedChain";
import LayoutContext from "../../contexts/LayoutContext";
import Header from "./Header";
import type { HeaderProps } from "./Header";
import Footer from "./Footer";

export default function Layout({
  children,
  ...headerProps
}: {
  children: React.ReactNode;
} & HeaderProps) {
  const { requestedChain, connectedChain } = useRequestedChain();
  const { address } = useAccount();
  const { t } = useLocale();
  const [chain, setChain] =
    useState<ReturnType<typeof useRequestedChain>["connectedChain"]>(undefined);

  useEffect(() => {
    setChain(connectedChain);
  }, [connectedChain]);

  // Dark mode only for now
  const { colorMode, toggleColorMode } = useColorMode();
  useEffect(() => {
    if (colorMode === "light") toggleColorMode();
  }, [colorMode]);

  const [allowNetworkChange, setAllowNetworkChange] = useState<boolean>(true);

  return (
    <LayoutContext.Provider value={{ allowNetworkChange, setAllowNetworkChange }}>
      <OpenPanelComponent
        clientId={process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID!}
        trackScreenViews={true}
        // trackAttributes={true}
        // trackOutgoingLinks={true}
        profileId={address}
      />
      <Header title={headerProps.title} allowNetworkChange={allowNetworkChange} />
      {chain && chain?.id !== requestedChain.id && (
        <chakra.div px={{ base: 0, md: 8 }} mt={1} position={"absolute"} w={"full"} zIndex={"10"}>
          <Alert status="warning" mb={4}>
            <AlertIcon />{" "}
            {t("PLEASE_CONNECT_TO", {
              network: requestedChain.name,
            })}
          </Alert>
        </chakra.div>
      )}
      <chakra.div bg={"gray.800"}>{children}</chakra.div>
      <Footer />
    </LayoutContext.Provider>
  );
}

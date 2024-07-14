import { useEffect } from "react";
import { chakra, Alert, AlertIcon, useColorMode } from "@chakra-ui/react";
import { useLocale } from "../../hooks/useLocale";
import { useRequestedChain } from "../../hooks/useRequestedChain";
import Header from "./Header";
import type { HeaderProps } from "./Header";
import Footer from "./Footer";

export default function Layout({
  children,
  ...headerProps
}: {
  children: React.ReactNode;
} & HeaderProps) {
  const { requestedChain, connectedChain: chain } = useRequestedChain();

  const { t } = useLocale();

  // Dark mode only for now
  const { colorMode, toggleColorMode } = useColorMode();
  useEffect(() => {
    if (colorMode === "light") toggleColorMode();
  }, [colorMode]);

  return (
    <>
      <Header {...headerProps} />
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
    </>
  );
}

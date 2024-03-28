import { useEffect } from "react";
import { chakra, Alert, AlertIcon, useColorMode } from "@chakra-ui/react";
import { useNetwork } from "wagmi";
import { getDefaultChain } from "lib/utils/chain";
import { useIsMounted } from "../../hooks/useIsMounted";
import { useLocale } from "../../hooks/useLocale";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ title, children }: { title?: string; children: React.ReactNode }) {
  const isMounted = useIsMounted();
  const { chain } = useNetwork();

  const { t } = useLocale();

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
              network: getDefaultChain().name,
            })}
          </Alert>
        </chakra.div>
      )}
      <chakra.div bg={"gray.800"}>{children}</chakra.div>
      <Footer />
    </>
  );
}

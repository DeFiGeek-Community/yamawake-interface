import { Button, ButtonProps, useDisclosure } from "@chakra-ui/react";
import ProvidersList from "./ProvidersList";
import { useLocale } from "../../hooks/useLocale";

export default function ConnectButton(props: ButtonProps) {
  const providersListDisclosure = useDisclosure();
  const { t } = useLocale();

  return (
    <>
      <Button
        onClick={providersListDisclosure.onOpen}
        variant={"outline"}
        size={{ base: "xs", md: "sm" }}
        w={"full"}
        {...props}
      >
        {t("CONNECT_WALLET")}
      </Button>
      <ProvidersList
        isOpen={providersListDisclosure.isOpen}
        onClose={providersListDisclosure.onClose}
        onConnectSuccess={providersListDisclosure.onClose}
      />
    </>
  );
}

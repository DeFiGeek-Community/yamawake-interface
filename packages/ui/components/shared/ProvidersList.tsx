import { useConnect, useDisconnect } from "wagmi";
import { switchNetwork } from "@wagmi/core";
import { Button, Stack, Flex, useToast } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import ProviderLogo from "./ProviderLogo";
import { useLocale } from "../../hooks/useLocale";
import { useRouter } from "next/router";
import { getSupportedChain, isSupportedChain } from "lib/utils/chain";

export default function ProvidersList({
  isOpen,
  onConnectSuccess,
  onClose,
}: {
  isOpen: boolean;
  onConnectSuccess?: ({ address, chainId }: { address: `0x${string}`; chainId: number }) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const { chainName } = router.query;
  const toast = useToast({ position: "top-right", isClosable: true });
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect({
    chainId: typeof chainName === "string" ? getSupportedChain(chainName)?.id : undefined,
    onSuccess: async (data) => {
      let chainId = data.chain.id;
      if (!isSupportedChain(data.chain.id) && switchNetwork) {
        chainId = Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID!);
        await switchNetwork({ chainId });
      }

      onConnectSuccess &&
        onConnectSuccess({
          address: data.account,
          chainId,
        });
    },
    onError: (error: Error) => {
      disconnect();
      toast({
        description: error.message,
        status: "error",
        duration: 5000,
      });
    },
  });
  const { disconnect } = useDisconnect();
  const { t } = useLocale();

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("CONNECT_WALLET")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Stack spacing={4}>
            {connectors.map((connector) => (
              <Button
                disabled={!connector.ready}
                key={connector.id}
                id={`${connector.id}`}
                w={"full"}
                size={"lg"}
                onClick={() => {
                  connect({ connector });
                }}
              >
                <Flex w={"full"} alignItems={"center"} justifyContent={"space-between"}>
                  <>
                    {connector.name}
                    {!connector.ready && " (unsupported)"}
                    {isLoading && connector.id === pendingConnector?.id && " (connecting)"}
                  </>
                  <ProviderLogo width={"30px"} fontSize={"30px"} connectorId={connector.id} />
                </Flex>
              </Button>
            ))}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

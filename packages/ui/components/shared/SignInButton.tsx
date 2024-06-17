import { useAccount, usePublicClient } from "wagmi";
import { switchNetwork } from "@wagmi/core";
import { Button, ButtonProps, useDisclosure, useToast } from "@chakra-ui/react";
import { SignInParams } from "lib/types";
import { getDefaultChain, getSupportedChain, isSupportedChain } from "lib/utils/chain";
import { useSIWE } from "../../hooks/Auth/useSIWE";
import { useLocale } from "../../hooks/useLocale";
import { isContractWallet } from "lib/utils/safe";
import ProvidersList from "./ProvidersList";

export default function SignInButton({
  onSignInSuccess,
  onSignInError,
  text,
  ...buttonProps
}: {
  onSignInSuccess: () => void;
  onSignInError: (error: Error) => void;
  text?: string;
} & ButtonProps) {
  const providersListDisclosure = useDisclosure();
  const { address: connectedAddress, isConnected } = useAccount({
    onConnect: async () => {},
  });
  const publicClient = usePublicClient();

  const { chain } = useAccount();
  const { t } = useLocale();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { loading, signIn } = useSIWE();
  const title = buttonProps.title ? buttonProps.title : t("SIGN_IN_WITH_ETHEREUM");

  const processSignIn = async (params: SignInParams) => {
    try {
      await signIn(params);
      onSignInSuccess && onSignInSuccess();
    } catch (e) {
      onSignInError && onSignInError(e as Error);
    }
  };

  return (
    <>
      <Button
        {...buttonProps}
        variant={"solid"}
        colorScheme={"green"}
        isLoading={loading}
        onClick={
          !connectedAddress || !chain?.id
            ? () => {
                providersListDisclosure.onOpen();
              }
            : async () => {
                let chainId = chain.id;
                if (!isSupportedChain(chain.id) && switchNetwork) {
                  chainId = getDefaultChain().id;
                  await switchNetwork({ chainId });
                }
                await processSignIn({
                  title: title,
                  targetAddress: connectedAddress as `0x${string}`,
                  chainId,
                });
              }
        }
      >
        {text ? text : t("SIGN_IN_WITH_ETHEREUM")}
      </Button>
      {!isConnected && (
        <ProvidersList
          isOpen={providersListDisclosure.isOpen}
          onClose={providersListDisclosure.onClose}
          onConnectSuccess={async ({
            address,
            chainId,
          }: {
            address: `0x${string}`;
            chainId: number;
          }) => {
            try {
              const { isSafe: isSafeWallet } = await isContractWallet(publicClient, address);
              if (isSafeWallet) {
                toast({
                  title: t("SIGN_SAFE_ACCOUNT"),
                  status: "success",
                  duration: 10000,
                });
              }
            } catch (e) {
              console.log("Failed to check safe wallet");
            }
            await processSignIn({
              title: title,
              targetAddress: address,
              chainId,
            });
            providersListDisclosure.onClose();
          }}
        />
      )}
    </>
  );
}

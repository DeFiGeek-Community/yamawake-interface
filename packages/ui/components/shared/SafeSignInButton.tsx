import { useEffect, useState } from "react";
import { useAccount, useNetwork, usePublicClient } from "wagmi";
import { switchNetwork } from "@wagmi/core";
import { Image, Button, ButtonProps, useDisclosure, useToast } from "@chakra-ui/react";
import { SignInParams } from "lib/types";
import { getDefaultChain, isSupportedChain } from "lib/utils/chain";
import { useSIWE } from "../../hooks/Auth/useSIWE";
import { useLocale } from "../../hooks/useLocale";
import { isContractWallet } from "lib/utils/safe";
import ProvidersList from "./ProvidersList";
import { SafeAddressModal } from "./SafeAddressModal";
import safeLogo from "assets/images/safe.png";

export default function SafeSignInButton({
  onSignInSuccess,
  onSignInError,
  text,
  ...buttonProps
}: {
  onSignInSuccess: () => void;
  onSignInError: (error: Error) => void;
  text?: string;
} & ButtonProps) {
  const safeModalDisclosure = useDisclosure();
  const providersListDisclosure = useDisclosure();
  const { address: connectedAddress, isConnected } = useAccount({
    onConnect: async () => {},
  });
  const publicClient = usePublicClient();
  const { chain } = useNetwork();
  const { t } = useLocale();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { loading, signIn, error } = useSIWE();
  const [safeAddress, setSafeAddress] = useState<`0x${string}` | undefined>();
  const title = buttonProps.title ? buttonProps.title : t("SIGN_IN_WITH_ETHEREUM");

  useEffect(() => {
    if (error)
      toast({
        title: error.message,
        status: "error",
        duration: 5000,
      });
  }, [error]);

  const processSignIn = async (params: SignInParams) => {
    try {
      await signIn(params);
      onSignInSuccess && onSignInSuccess();
    } catch (e) {
      onSignInError && onSignInError(e as Error);
    }
  };

  const switchToSupportedNetwork = async (chainId: number): Promise<number> => {
    let _chainId = chainId;
    if (!isSupportedChain(chainId) && switchNetwork) {
      _chainId = getDefaultChain().id;
      await switchNetwork({ chainId: _chainId });
    }
    return _chainId;
  };

  return (
    <>
      <Button
        {...buttonProps}
        leftIcon={<Image width={"12px"} height={"12px"} alt={"Safe account"} src={safeLogo.src} />}
        variant={"solid"}
        isLoading={loading}
        onClick={
          !connectedAddress || !chain?.id
            ? () => {
                safeModalDisclosure.onOpen();
              }
            : async () => {
                try {
                  const chainId = await switchToSupportedNetwork(chain.id);
                  safeModalDisclosure.onOpen();
                } catch (e: any) {
                  toast({
                    title: e.message,
                    status: "error",
                    duration: 5000,
                  });
                }
              }
        }
      >
        {text ? text : t("SIGN_IN_WITH_ETHEREUM_AS_SAFE")}
      </Button>
      <SafeAddressModal
        isOpen={safeModalDisclosure.isOpen}
        onClose={safeModalDisclosure.onClose}
        onProceed={
          !!isConnected && !!chain
            ? async (safeAddress) => {
                const chainId = await switchToSupportedNetwork(chain.id);
                await processSignIn({
                  title: title,
                  targetAddress: connectedAddress as `0x${string}`,
                  chainId,
                  safeAddress,
                });
              }
            : async (_safeAddress) => {
                setSafeAddress(_safeAddress);
                providersListDisclosure.onOpen();
              }
        }
      />
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
              console.log("IsSafe: ", isSafeWallet, address);
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
              safeAddress,
            });
            providersListDisclosure.onClose();
          }}
        />
      )}
    </>
  );
}

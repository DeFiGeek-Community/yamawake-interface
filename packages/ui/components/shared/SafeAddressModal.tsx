import { useEffect, useState } from "react";
import { type Chain, switchNetwork, SwitchNetworkArgs } from "@wagmi/core";
import {
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Tooltip,
  Input,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useLocale } from "../../hooks/useLocale";
import { useRequestedChain } from "../../hooks/useRequestedChain";
import { useIsContractWallet } from "../../hooks/useIsContractWallet";
import NetworkMenu from "./NetworkMenu";
import { useFormik } from "formik";
import { CheckCircleIcon, QuestionIcon } from "@chakra-ui/icons";

type SafeAddressModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (safeAddress: `0x${string}`) => void;
};

type SafeAddressForm = { networkId: number | undefined; safeAddress: `0x${string}` | undefined };
type SafeAddressFormError = { safeAddress?: string };

export function SafeAddressModal({ isOpen, onClose, onProceed }: SafeAddressModalProps) {
  const { requestedChain, connectedChain: chain } = useRequestedChain();
  const [selectedChain, setSelectedChain] = useState<Chain>(requestedChain);
  const { t, locale } = useLocale();
  const toast = useToast({ position: "top-right", isClosable: true });
  const formikProps = useFormik<SafeAddressForm>({
    enableReinitialize: true,
    initialValues: { networkId: undefined, safeAddress: undefined },
    onSubmit: () => {},
    validate: (value: SafeAddressForm) => {
      const errors: SafeAddressFormError = {};
      if (!isSafe) {
        errors.safeAddress = "Invalid Safe account";
      }
      return errors;
    },
  });
  const { isSafe, isChecking } = useIsContractWallet({
    chainId: selectedChain.id,
    address: formikProps.values.safeAddress,
  });

  useEffect(() => {
    formikProps.validateForm();
  }, [isChecking]);

  const handleSwitchNetwork = async (args: SwitchNetworkArgs) => {
    try {
      await switchNetwork(args);
    } catch (e: any) {
      toast({
        description: e.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      size={"lg"}
      blockScrollOnMount={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("SIGN_IN_WITH_ETHEREUM_AS_SAFE")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {!chain ? (
            <NetworkMenu
              allowNetworkChange={false}
              chain={selectedChain}
              handleSwitchNetwork={(chain: Chain) => {}}
            />
          ) : (
            <>
              {chain?.id !== requestedChain.id ? (
                <Button
                  size={"md"}
                  colorScheme="red"
                  onClick={() => handleSwitchNetwork({ chainId: requestedChain.id })}
                >
                  {t("SWITCH_NETWORK_TO", { chainName: requestedChain.name })}
                </Button>
              ) : (
                <NetworkMenu
                  allowNetworkChange={false}
                  chain={requestedChain}
                  handleSwitchNetwork={(chain: Chain) => {}}
                />
              )}
            </>
          )}
          <div>
            <form onSubmit={formikProps.handleSubmit}>
              <FormControl
                mt={4}
                isInvalid={!!formikProps.errors.safeAddress && !!formikProps.touched.safeAddress}
              >
                <FormLabel htmlFor="token" alignItems={"baseline"}>
                  {t("SAFE_ADDRESS")}
                  <Tooltip hasArrow label={t("SAFE_ADDRESS_HELP")}>
                    <QuestionIcon mb={1} ml={1} />
                  </Tooltip>
                </FormLabel>
                <InputGroup>
                  {isSafe && (
                    <InputRightElement pointerEvents="none">
                      <CheckCircleIcon color="green.300" />
                    </InputRightElement>
                  )}
                  <Input
                    id="safeAddress"
                    name="safeAddress"
                    onBlur={formikProps.handleBlur}
                    onChange={async (event: React.ChangeEvent<any>) => {
                      formikProps.handleChange(event);
                    }}
                    value={formikProps.values.safeAddress ? formikProps.values.safeAddress : ""}
                    placeholder="e.g. 0x78cE186ccCd42d632aBBeA31D247a619389cb76c"
                  />
                </InputGroup>
                <FormErrorMessage>{formikProps.errors.safeAddress}</FormErrorMessage>
              </FormControl>

              <Button
                mt={8}
                w={"full"}
                variant="solid"
                colorScheme="green"
                isLoading={isChecking}
                isDisabled={!formikProps.isValid}
                onClick={() => onProceed(formikProps.values.safeAddress!)}
              >
                {t("NEXT")}
              </Button>
            </form>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

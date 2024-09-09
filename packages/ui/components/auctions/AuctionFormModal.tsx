import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useToast, useColorMode } from "@chakra-ui/react";
import { CustomProvider } from "rsuite";
import { useAtom } from "jotai";
import { creatingAuctionAtom } from "lib/store";
import { Steps } from "./Steps";
import MetaDataForm from "./TemplateV1/MetaDataForm";
import useMetaDataForm from "../../hooks/TemplateV1/useMetaDataForm";
import { useLocale } from "../../hooks/useLocale";
import TxSentToast from "../shared/TxSentToast";
import AuctionFormWrapper from "./AuctionFormWrapper";
import { useSafeWaitForTransaction } from "../../hooks/Safe";
import { decodeEventLog, parseAbi } from "viem";
import { ChainNameTag } from "../shared/ChainNameTag";

type AuctionFormModalProps = {
  chainId: number;
  address: `0x${string}`;
  safeAddress: `0x${string}` | undefined;
  isOpen: boolean;
  onClose: () => void;
  onDeploy?: () => void;
  onDeployConfirmed?: () => void;
  onInformationSaved?: () => void;
  onInformationCanceled?: () => void;
};

export default function AuctionFormModal({
  chainId,
  address,
  safeAddress,
  isOpen,
  onClose,
  onDeploy,
  onDeployConfirmed,
  onInformationSaved,
  onInformationCanceled,
}: AuctionFormModalProps) {
  const toast = useToast({ position: "top-right", isClosable: true });
  const { colorMode, setColorMode, toggleColorMode } = useColorMode();
  const [step, setStep] = useState<1 | 2>(1);
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>(undefined);
  const { t } = useLocale();
  const [tx, setTx] = useState<string | undefined>(undefined);
  const [creatingAuction, setCreatingAuction] = useAtom(creatingAuctionAtom);

  const waitFn = useSafeWaitForTransaction({
    hash: tx as `0x${string}`,
    enabled: !!tx,
    safeAddress: safeAddress,
    onSuccess(data) {
      toast({
        title: t("TRANSACTION_CONFIRMED"),
        status: "success",
        duration: 5000,
      });
    },
    onError(e) {
      handleClose();
      toast({
        description: e.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  useEffect(() => {
    if (waitFn.isSuccess && !!waitFn.data) {
      for (let i = 0; i < waitFn.data.logs.length; i++) {
        try {
          const topics = decodeEventLog({
            abi: parseAbi(["event Deployed(bytes32, address)"]),
            data: waitFn.data.logs[i].data,
            topics: waitFn.data.logs[i].topics,
          });
          setContractAddress(topics.args[1]);
          setTx(undefined);
          onDeployConfirmed && onDeployConfirmed();
          break;
        } catch (e) {
          continue;
        }
      }
    }
  }, [waitFn.isSuccess]);

  const handleClose = () => {
    metaFormikProps.resetForm();
    onClose();
    setStep(1);
    setCreatingAuction(undefined);
  };

  const { formikProps: metaFormikProps } = useMetaDataForm({
    chainId,
    contractId: contractAddress,
    minRaisedAmount:
      creatingAuction && creatingAuction.minRaisedAmount ? creatingAuction.minRaisedAmount : 0,
    onSubmitSuccess: (response) => {
      handleClose();
      onInformationSaved && onInformationSaved();
      toast({
        title: t("SALE_INFORMATION_SUCCESSFULLY_SAVED"),
        status: "success",
        duration: 5000,
      });
    },
    onSubmitError: (e: any) => {
      toast({
        description: e.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  const stepParams = [
    { number: 1, label: t("DEPLOY_CONTRACT") },
    { number: 2, label: t("INPUT_INFORMATION") },
  ];

  return (
    <CustomProvider theme={colorMode}>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        closeOnOverlayClick={false}
        size={step === 1 ? "lg" : "4xl"}
        blockScrollOnMount={false}
        isCentered={true}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t("CREATE_NEW_SALE")}
            <ChainNameTag chainId={chainId} ml={4} verticalAlign={"text-bottom"} />
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Steps
              mx={"auto"}
              maxW={"450px"}
              pb={6}
              px={10}
              stepParams={stepParams}
              currentStep={step}
            />
            {step === 1 ? (
              <AuctionFormWrapper
                chainId={chainId}
                address={address}
                safeAddress={safeAddress}
                onSubmitSuccess={(result) => {
                  setTx(result.hash);
                  setStep(2);
                  onDeploy && onDeploy();
                  toast({
                    title: t("TRANSACTION_SENT"),
                    status: "success",
                    duration: 5000,
                    render: (props) => <TxSentToast txid={result.hash} {...props} />,
                  });
                }}
              />
            ) : (
              <MetaDataForm
                chainId={chainId}
                formikProps={metaFormikProps}
                waitFn={waitFn}
                onSkip={() => {
                  onInformationCanceled && onInformationCanceled();
                  handleClose();
                }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </CustomProvider>
  );
}

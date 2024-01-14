import { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useToast, useColorMode } from "@chakra-ui/react";
import { useAccount, useContractEvent, useWaitForTransaction } from "wagmi";
import { CustomProvider } from "rsuite";
import { useAtom } from "jotai";
import FactoryABI from "lib/constants/abis/Factory.json";
import { creatingAuctionAtom, waitingCreationTxAtom } from "lib/store";
import { Steps } from "./Steps";
import MetaDataForm from "./TemplateV1/MetaDataForm";
import useMetaDataForm from "../../hooks/TemplateV1/useMetaDataForm";
import { useLocale } from "../../hooks/useLocale";
import TxSentToast from "../shared/TxSentToast";
import AuctionFormWrapper from "./AuctionFormWrapper";

type AuctionFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDeploy?: () => void;
  onDeployConfirmed?: () => void;
  onInformationSaved?: () => void;
  onInformationCanceled?: () => void;
};

export default function AuctionFormModal({
  isOpen,
  onClose,
  onDeploy,
  onDeployConfirmed,
  onInformationSaved,
  onInformationCanceled,
}: AuctionFormModalProps) {
  const { address } = useAccount();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { colorMode, setColorMode, toggleColorMode } = useColorMode();
  const [step, setStep] = useState<1 | 2>(1);
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>(undefined);
  const { t } = useLocale();
  const [tx, setTx] = useState<string | undefined>(undefined);
  const txRef = useRef(tx);
  const [creatingAuction, setCreatingAuction] = useAtom(creatingAuctionAtom);
  useEffect(() => {
    txRef.current = tx;
  }, [tx]);

  const waitFn = useWaitForTransaction({
    hash: tx as `0x${string}`,
    enabled: !!tx,
    onSuccess(data) {
      toast({
        title: t("TRANSACTION_CONFIRMED"),
        status: "success",
        duration: 5000,
      });
    },
    onError(e) {
      toast({
        description: e.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  const handleClose = () => {
    metaFormikProps.resetForm();
    onClose();
    setStep(1);
    setCreatingAuction(undefined);
  };

  const { formikProps: metaFormikProps } = useMetaDataForm({
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

  const unwatch = useContractEvent({
    address: process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`,
    abi: FactoryABI,
    eventName: "Deployed",
    listener: (logs: any[]) => {
      const { args, transactionHash } = logs[0];
      if ((transactionHash as string).toLowerCase() === (txRef.current as string).toLowerCase()) {
        unwatch && unwatch();
        setContractAddress(args.deployedAddress as `0x${string}`);
        setTx(undefined);
        onDeployConfirmed && onDeployConfirmed();
      }
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
          <ModalHeader>{t("CREATE_NEW_SALE")}</ModalHeader>
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
              <>
                <AuctionFormWrapper
                  address={address as `0x${string}`}
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
              </>
            ) : (
              <MetaDataForm
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

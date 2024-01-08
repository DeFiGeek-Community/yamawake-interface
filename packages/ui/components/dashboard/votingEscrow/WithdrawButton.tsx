import { ButtonProps, Button, useToast } from "@chakra-ui/react";
import { useNetwork } from "wagmi";
import { useLocale } from "../../../hooks/useLocale";
import useWithdraw from "../../../hooks/VotingEscrow/useWithdraw";
import TxSentToast from "../../shared/TxSentToast";

export default function WithdrawButton(props: ButtonProps) {
  const { t } = useLocale();
  const { chain } = useNetwork();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { writeFn, waitFn } = useWithdraw({
    onSuccessWrite(data) {
      toast({
        title: t("TRANSACTION_SENT"),
        status: "success",
        duration: 5000,
        render: (props) => <TxSentToast txid={data.hash} {...props} />,
      });
    },
    onErrorWrite(e) {
      toast({
        description: e.message,
        status: "error",
        duration: 5000,
      });
    },
    onSuccessConfirm(data) {
      toast({
        title: t("TRANSACTION_CONFIRMED"),
        status: "success",
        duration: 5000,
      });
    },
    onErrorConfirm(e) {
      toast({
        description: e.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  return (
    <>
      <Button
        variant={"solid"}
        colorScheme="green"
        size={"sm"}
        onClick={() => writeFn.write!()}
        isLoading={writeFn.isLoading || waitFn.isLoading}
        isDisabled={chain?.unsupported || !writeFn.write}
        {...props}
      >
        {t("VE_WITHDRAW")}
      </Button>
    </>
  );
}

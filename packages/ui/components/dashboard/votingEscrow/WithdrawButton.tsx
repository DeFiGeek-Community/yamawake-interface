import { ButtonProps, Button } from "@chakra-ui/react";
import { useNetwork } from "wagmi";
import { useLocale } from "../../../hooks/useLocale";
import useWithdraw from "../../../hooks/VotingEscrow/useWithdraw";

export default function WithdrawButton(props: ButtonProps) {
  const { t } = useLocale();
  const { chain } = useNetwork();
  const { writeFn, waitFn } = useWithdraw({});

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

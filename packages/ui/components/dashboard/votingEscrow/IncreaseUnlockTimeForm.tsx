import { ButtonProps, Button, useDisclosure } from "@chakra-ui/react";
import type { SafeComponentProps } from "lib/types";
import { LockType } from "lib/types/VotingEscrow";
import { useLocale } from "../../../hooks/useLocale";
import FormModal from "./FormModal";

export default function IncreaseUnlockTimeForm({
  account,
  safeAddress,
  ...props
}: SafeComponentProps & ButtonProps) {
  const { t } = useLocale();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button variant={"solid"} colorScheme="green" size={"sm"} onClick={onOpen} {...props}>
        {t("VE_INCREASE_UNLOCK_TIME")}
      </Button>
      {isOpen && (
        <FormModal
          account={account}
          safeAddress={safeAddress}
          type={LockType.INCREASE_UNLOCK_TIME}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </>
  );
}

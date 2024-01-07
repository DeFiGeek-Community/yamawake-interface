import { Button, useDisclosure } from "@chakra-ui/react";
import { LockType } from "lib/types/VotingEscrow";
import { useLocale } from "../../../hooks/useLocale";
import FormModal from "./FormModal";

export default function IncreaseAmountForm({ address }: { address?: `0x${string}` }) {
  const { t } = useLocale();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button variant={"solid"} colorScheme="green" size={"sm"} onClick={onOpen}>
        {t("INCREASE_AMOUNT")}
      </Button>
      {isOpen && (
        <FormModal
          address={address}
          type={LockType.INCREASE_AMOUNT}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </>
  );
}

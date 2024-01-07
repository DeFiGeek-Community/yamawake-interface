import { ButtonProps, Button, useDisclosure } from "@chakra-ui/react";
import { LockType } from "lib/types/VotingEscrow";
import { useLocale } from "../../../hooks/useLocale";
import FormModal from "./FormModal";

export default function NewLockForm({
  address,
  ...props
}: { address?: `0x${string}` } & ButtonProps) {
  const { t } = useLocale();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button variant={"solid"} colorScheme="green" size={"sm"} onClick={onOpen} {...props}>
        {t("VE_CREATE_LOCK")}
      </Button>
      {isOpen && (
        <FormModal
          address={address}
          type={LockType.CREATE_LOCK}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </>
  );
}

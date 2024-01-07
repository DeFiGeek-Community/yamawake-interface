import {
  Button,
  HStack,
  Spinner,
  chakra,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { useLocale } from "../../../hooks/useLocale";
import useBalanceOf from "../../../hooks/VotingEscrow/useBalanceOf";
import useLocked from "../../../hooks/VotingEscrow/useLocked";
import NewLockForm from "./NewLockForm";
import { tokenAmountFormat } from "lib/utils";
import IncreaseUnlockTimeForm from "./IncreaseUnlockTimeForm";
import IncreaseAmountForm from "./IncreaseAmountForm";

export default function VotingEscrow({ address }: { address?: `0x${string}` }) {
  const { t } = useLocale();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { readFn: balance } = useBalanceOf(address);
  const { readFn: locked } = useLocked(address);

  return (
    <>
      <HStack justifyContent={"space-between"}>
        <chakra.p color={"gray.400"}>{t("BALANCE")}</chakra.p>
        <chakra.p fontSize={"2xl"}>
          {typeof balance.data === "undefined" ? (
            <Spinner />
          ) : (
            <>{tokenAmountFormat(balance.data, 18, 2)}</>
          )}
          <chakra.span color={"gray.400"} fontSize={"lg"} ml={1}>
            veYMWK
          </chakra.span>
        </chakra.p>
      </HStack>
      <HStack justifyContent={"space-between"} mt={1}>
        <chakra.p color={"gray.400"}>{t("YMWK_LOCKED")}</chakra.p>
        <chakra.p fontSize={"2xl"}>
          {typeof locked.data === "undefined" ? (
            <Spinner />
          ) : (
            <>{tokenAmountFormat(locked.data[0], 18, 2)}</>
          )}
          <chakra.span color={"gray.400"} fontSize={"lg"} ml={1}>
            YMWK
          </chakra.span>
        </chakra.p>
      </HStack>
      <HStack justifyContent={"space-between"} mt={1}>
        <chakra.p color={"gray.400"}>{t("LOCKED_UNTIL")}</chakra.p>
        <chakra.p fontSize={"2xl"}>
          {typeof locked.data === "undefined" && <Spinner />}
          {locked.data && locked.data[1] === 0n && "-- / -- / --"}
          {locked.data && locked.data[1] > 0n && (
            <>{format(new Date(Number(locked.data[1]) * 1000), "yyyy / MM / dd")}</>
          )}
        </chakra.p>
      </HStack>
      {typeof locked.data === "undefined" && <Spinner />}

      {!!locked.data && locked.data[1] === 0n && <NewLockForm address={address} />}
      {!!locked.data &&
        locked.data[1] !== 0n &&
        Number(locked.data[1]) <= new Date().getTime() / 1000 && (
          <Button variant={"solid"} colorScheme="green" size={"sm"} onClick={() => {}}>
            {t("WITHDRAW")}
          </Button>
        )}
      {!!locked.data &&
        locked.data[1] !== 0n &&
        Number(locked.data[1]) > new Date().getTime() / 1000 && (
          <>
            <HStack spacing={4}>
              <IncreaseAmountForm address={address} />
              <IncreaseUnlockTimeForm address={address} />
            </HStack>
          </>
        )}
    </>
  );
}

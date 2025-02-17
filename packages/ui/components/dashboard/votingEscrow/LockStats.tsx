import { HStack, Spinner, chakra } from "@chakra-ui/react";
import { format } from "date-fns";
import { useLocale } from "../../../hooks/useLocale";
import useBalanceOf from "../../../hooks/VotingEscrow/useBalanceOf";
import useLocked from "../../../hooks/VotingEscrow/useLocked";
import NewLockForm from "./NewLockForm";
import { tokenAmountFormat } from "lib/utils";
import type { SafeComponentProps } from "lib/types";
import IncreaseUnlockTimeForm from "./IncreaseUnlockTimeForm";
import IncreaseAmountForm from "./IncreaseAmountForm";
import WithdrawButton from "./WithdrawButton";

export default function LockStats({ account, safeAddress }: SafeComponentProps) {
  const { t } = useLocale();
  const targetAccount = safeAddress || account;

  const { data: balance, error: balanceError } = useBalanceOf(targetAccount, true);
  const { data: locked, error: lockedError } = useLocked(targetAccount, true);

  return (
    <>
      <HStack justifyContent={"space-between"}>
        <chakra.p color={"gray.400"}>{t("BALANCE")}</chakra.p>
        <chakra.p fontSize={"2xl"}>
          {typeof balance === "undefined" ? (
            <Spinner />
          ) : (
            <>{tokenAmountFormat(balance.toString(), 18, 2)}</>
          )}
          <chakra.span color={"gray.400"} fontSize={"lg"} ml={1}>
            veYMWK
          </chakra.span>
        </chakra.p>
      </HStack>
      <HStack justifyContent={"space-between"} mt={1}>
        <chakra.p color={"gray.400"}>{t("YMWK_LOCKED")}</chakra.p>
        <chakra.p fontSize={"2xl"}>
          {typeof locked === "undefined" ? (
            <Spinner />
          ) : (
            <>{tokenAmountFormat(locked[0].toString(), 18, 2)}</>
          )}
          <chakra.span color={"gray.400"} fontSize={"lg"} ml={1}>
            YMWK
          </chakra.span>
        </chakra.p>
      </HStack>
      <HStack justifyContent={"space-between"} mt={1}>
        <chakra.p color={"gray.400"}>{t("LOCKED_UNTIL")}</chakra.p>
        <chakra.p fontSize={"2xl"}>
          {typeof locked === "undefined" ? (
            <Spinner />
          ) : locked[1] === BigInt(0) ? (
            <>{"-- / -- / --"}</>
          ) : (
            <>{format(new Date(Number(locked[1]) * 1000), "yyyy / MM / dd")}</>
          )}
        </chakra.p>
      </HStack>

      <HStack spacing={4} justifyContent={"flex-end"} mt={2}>
        {!!locked && locked[1] === 0n && (
          <NewLockForm account={account} safeAddress={safeAddress} />
        )}
        {!!locked && locked[1] !== 0n && Number(locked[1]) > new Date().getTime() / 1000 && (
          <>
            <IncreaseAmountForm account={account} safeAddress={safeAddress} />
            <IncreaseUnlockTimeForm account={account} safeAddress={safeAddress} />
          </>
        )}
        {!!locked && locked[1] !== 0n && Number(locked[1]) <= new Date().getTime() / 1000 && (
          <WithdrawButton account={account} safeAddress={safeAddress} />
        )}
      </HStack>
    </>
  );
}

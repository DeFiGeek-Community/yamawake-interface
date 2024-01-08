import { Button, HStack, VStack, Spinner, chakra, useToast } from "@chakra-ui/react";
import { useLocale } from "../../../hooks/useLocale";
import useTokens from "../../../hooks/FeeDistributor/useTokens";
import useClaimableTokens from "../../../hooks/Gauge/useClaimableTokens";
import useMint from "../../../hooks/Minter/useMint";
import TxSentToast from "../../shared/TxSentToast";
import FeeReward from "./FeeReward";

export default function Reward({ address }: { address?: `0x${string}` }) {
  const { t } = useLocale();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { readFn: tokens } = useTokens();
  // TODO readFn or prepareFn
  const { readFn, prepareFn: claimableTokens } = useClaimableTokens(address);
  const { writeFn, waitFn } = useMint({
    address,
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
      <HStack justifyContent={"space-between"} alignItems={"baseline"} mt={4}>
        <chakra.p color={"gray.400"}>{t("REWARDS")}</chakra.p>
        <VStack spacing={4} alignItems={"end"}>
          <HStack spacing={2}>
            <chakra.div fontSize={"2xl"}>
              {typeof claimableTokens.data === "undefined" && <Spinner />}
              {!!claimableTokens.data && typeof claimableTokens.data.result === "bigint" && (
                <>{claimableTokens.data.result.toString()}</>
              )}
              <chakra.span color={"gray.400"} fontSize={"lg"} ml={1}>
                YMWK
              </chakra.span>
            </chakra.div>
            <Button
              variant={"solid"}
              colorScheme="green"
              size={"sm"}
              isDisabled={!claimableTokens.data || !claimableTokens.data.result || !writeFn.write}
              isLoading={writeFn.isLoading || waitFn.isLoading}
              onClick={() => writeFn.write!()}
            >
              {t("CLAIM")}
            </Button>
          </HStack>
          {typeof tokens.data === "undefined" && <Spinner />}
          {!!tokens.data &&
            !!address &&
            tokens.data.map((token: `0x${string}`) => (
              <FeeReward key={token} address={address} token={token} />
            ))}
        </VStack>
      </HStack>
    </>
  );
}

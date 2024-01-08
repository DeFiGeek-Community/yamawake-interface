import { Button, HStack, Spinner, chakra, useToast } from "@chakra-ui/react";
import { useLocale } from "../../../hooks/useLocale";
import { zeroAddress } from "viem";
import useClaim from "../../../hooks/FeeDistributor/useClaim";
import TxSentToast from "../../shared/TxSentToast";

export default function Reward({
  address,
  token,
}: {
  address: `0x${string}`;
  token: `0x${string}`;
}) {
  const { t } = useLocale();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { prepareFn, writeFn, waitFn } = useClaim({
    address,
    token,
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
    <HStack spacing={2}>
      <chakra.div fontSize={"2xl"}>
        {typeof prepareFn.data === "undefined" && <Spinner />}
        {!!prepareFn.data && typeof prepareFn.data.result === "bigint" && (
          <>{prepareFn.data.result.toString()}</>
        )}
        <chakra.span color={"gray.400"} fontSize={"lg"} ml={1}>
          {token === zeroAddress ? "ETH" : "TODO"}
        </chakra.span>
      </chakra.div>
      <Button
        variant={"solid"}
        colorScheme="green"
        size={"sm"}
        isDisabled={!prepareFn.data || !prepareFn.data.result || !writeFn.write}
        isLoading={writeFn.isLoading || waitFn.isLoading}
        onClick={() => writeFn.write!()}
      >
        {t("CLAIM")}
      </Button>
    </HStack>
  );
}

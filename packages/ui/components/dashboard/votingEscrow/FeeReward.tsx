import { HStack, VStack, Spinner, chakra, Button } from "@chakra-ui/react";
import { useLocale } from "../../../hooks/useLocale";
import { zeroAddress } from "viem";
import useClaim from "../../../hooks/FeeDistributor/useClaim";

export default function Reward({
  address,
  token,
}: {
  address: `0x${string}`;
  token: `0x${string}`;
}) {
  const { t } = useLocale();
  const { prepareFn, writeFn, waitFn } = useClaim({ address, token });

  return (
    <HStack spacing={2}>
      <chakra.p fontSize={"2xl"}>
        {typeof prepareFn.data === "undefined" && <Spinner />}
        {!!prepareFn.data && typeof prepareFn.data.result === "bigint" && (
          <>{prepareFn.data.result.toString()}</>
        )}
        <chakra.span color={"gray.400"} fontSize={"lg"} ml={1}>
          {token === zeroAddress ? "ETH" : "TODO"}
        </chakra.span>
      </chakra.p>
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

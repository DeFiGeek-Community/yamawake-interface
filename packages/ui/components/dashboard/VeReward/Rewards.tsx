import { HStack, VStack, Spinner, chakra, Button } from "@chakra-ui/react";
import { useLocale } from "../../../hooks/useLocale";
import useTokens from "../../../hooks/FeeDistributor/useTokens";
import useClaimableTokens from "../../../hooks/Gauge/useClaimableTokens";
import useMint from "../../../hooks/Minter/useMint";
import FeeReward from "./FeeReward";

export default function Reward({ address }: { address?: `0x${string}` }) {
  const { t } = useLocale();

  const { readFn: tokens } = useTokens();
  // TODO readFn or prepareFn
  const { readFn, prepareFn: claimableTokens } = useClaimableTokens(address);
  const { writeFn, waitFn } = useMint({ address });
  console.log(readFn, claimableTokens);

  return (
    <>
      <HStack justifyContent={"space-between"} alignItems={"baseline"} mt={4}>
        <chakra.p color={"gray.400"}>{t("REWARDS")}</chakra.p>
        <VStack spacing={4} alignItems={"end"}>
          <HStack spacing={2}>
            <chakra.p fontSize={"2xl"}>
              {typeof claimableTokens.data === "undefined" && <Spinner />}
              {!!claimableTokens.data && typeof claimableTokens.data.result === "bigint" && (
                <>{claimableTokens.data.result.toString()}</>
              )}
              <chakra.span color={"gray.400"} fontSize={"lg"} ml={1}>
                YMWK
              </chakra.span>
            </chakra.p>
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

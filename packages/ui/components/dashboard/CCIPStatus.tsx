import { Heading, Box, HStack, Link, Flex, Spinner, chakra } from "@chakra-ui/react";
import { CheckCircleIcon, ExternalLinkIcon, TimeIcon, WarningIcon } from "@chakra-ui/icons";
import { CHAIN_INFO } from "lib/constants/chains";
import { CCIP_MESSAGE_STATES } from "lib/constants/ccip";
import useCCIPStatus from "../../hooks/useCCIPStatus";
import { useLocale } from "../../hooks/useLocale";

export default function CCIPStatus({
  chainId,
  ccipMessageId,
}: {
  chainId: number;
  ccipMessageId: string | null;
}) {
  const sourceChain = CHAIN_INFO[chainId];
  const destinationChainId = sourceChain.sourceId!;
  const { t } = useLocale();
  const { status, isError } = useCCIPStatus({
    sourceChainId: chainId,
    destinationChainId: destinationChainId,
    messageId: ccipMessageId,
  });

  return ccipMessageId && status ? (
    <Box mt={2}>
      <Heading fontSize={"sm"}>{t("PAST_TRANSACTION")}</Heading>
      <HStack justifyContent={"space-between"} mt={2}>
        <chakra.p color={"gray.400"}>
          <Link href={`https://ccip.chain.link/msg/${ccipMessageId}`} target="_blank">
            {`${ccipMessageId.slice(0, 14)}...${ccipMessageId.slice(-14)}`}
            <ExternalLinkIcon ml={2} />
          </Link>
        </chakra.p>
        <Flex alignItems={"center"}>
          {CCIP_MESSAGE_STATES[status] === CCIP_MESSAGE_STATES.UNTOUCHED && (
            <TimeIcon fontSize={"lg"} />
          )}
          {CCIP_MESSAGE_STATES[status] === CCIP_MESSAGE_STATES.IN_PROGRESS && (
            <Spinner fontSize={"lg"} />
          )}
          {CCIP_MESSAGE_STATES[status] === CCIP_MESSAGE_STATES.SUCCESS && (
            <CheckCircleIcon fontSize={"lg"} color={"green.300"} />
          )}
          {CCIP_MESSAGE_STATES[status] === CCIP_MESSAGE_STATES.FAILURE && (
            <WarningIcon fontSize={"lg"} color={"red.300"} />
          )}
          <chakra.span ml={2}>{status}</chakra.span>
        </Flex>
      </HStack>
    </Box>
  ) : null;
}

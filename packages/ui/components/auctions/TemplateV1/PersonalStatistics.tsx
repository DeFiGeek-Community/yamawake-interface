import { WarningIcon } from "@chakra-ui/icons";
import { chakra, BoxProps, Box, Stack, StackDivider, Flex } from "@chakra-ui/react";
import {
  etherAmountFormat,
  getDecimalsForView,
  getExpectedAmount,
  tokenAmountFormat,
  getTokenPriceAgainstETHWithMinPrice,
} from "lib/utils";
import Big, { add, getBigNumber, multiply } from "lib/utils/bignumber";
import { useLocale } from "../../../hooks/useLocale";

interface Props {
  inputValue: number;
  myContribution: Big;
  minRaisedAmount: Big;
  totalRaised: Big;
  allocatedAmount: Big;
  distributedTokenSymbol: string;
  distributedTokenDecimal: number;
  raisedTokenSymbol: string;
  raisedTokenDecimal: number;
  isEnding: boolean;
  isClaimed: boolean;
  isLodingTX: boolean;
}
export default function PersonalStatistics({
  inputValue,
  myContribution,
  minRaisedAmount,
  totalRaised,
  allocatedAmount,
  distributedTokenSymbol,
  distributedTokenDecimal,
  raisedTokenSymbol,
  raisedTokenDecimal,
  isEnding,
  isClaimed,
  isLodingTX,
  ...boxProps
}: Props & BoxProps) {
  const inputValueInBig = multiply(Big(inputValue), Big(10).pow(raisedTokenDecimal));
  const expectedAmount = tokenAmountFormat(
    getExpectedAmount(myContribution, inputValueInBig, totalRaised, allocatedAmount),
    distributedTokenDecimal,
    getDecimalsForView(allocatedAmount, distributedTokenDecimal),
  );
  const sumOfContributionAmount = etherAmountFormat(add(myContribution, inputValueInBig));
  const fixedContributionAmount = etherAmountFormat(myContribution);
  const inputtingValueInFormat = tokenAmountFormat(inputValueInBig, raisedTokenDecimal, 2);
  const { t } = useLocale();

  // if(isLoading) {
  //     return <Card {...boxProps}>
  //       <CardBody>
  //         <SkeletonText />
  //       </CardBody>
  //     </Card>
  // }

  return (
    <Box {...boxProps}>
      <Stack divider={<StackDivider />} spacing="4">
        <Box>
          <Flex justifyContent={"space-between"}>
            <chakra.span fontSize={"sm"} color={"gray.400"}>
              {!isEnding ? t("ESTIMATED_AMOUNT_YOU_WILL_RECEIVE") : t("AMOUNT_YOU_WILL_RECEIVE")}:
            </chakra.span>
            <chakra.div textAlign={"right"}>
              <chakra.span fontWeight={"bold"} ml={2}>
                {expectedAmount} {distributedTokenSymbol.toUpperCase()}
              </chakra.span>
            </chakra.div>
          </Flex>
          {parseFloat(expectedAmount) === 0 && myContribution.gt(0) ? (
            <chakra.p fontSize={"xs"} opacity={".75"} color={"yellow.500"}>
              <WarningIcon />{" "}
              {t("THE_ESTIMATED_TOKEN_AMOUNT_IS_LESS_THAN_THE_PERMITTED_NUMBER_OF_DECIMALS")}
            </chakra.p>
          ) : (
            <chakra.p textAlign={"right"} color={"gray.400"} fontSize={"xs"}>
              {`1 ${distributedTokenSymbol.toUpperCase()} = ${getTokenPriceAgainstETHWithMinPrice(
                minRaisedAmount,
                allocatedAmount,
                getBigNumber(totalRaised).add(inputValueInBig),
                distributedTokenDecimal,
              ).toFixed(8)} ETH`}
            </chakra.p>
          )}
        </Box>
        {!isEnding ? (
          <Flex justifyContent={"space-between"}>
            <chakra.span fontSize={"sm"} color={"gray.400"}>
              {t("YOUR_CONTRIBUTED_AMOUNT")}:{" "}
            </chakra.span>
            <chakra.div textAlign={"right"}>
              <chakra.span fontWeight={"bold"} ml={2}>
                {sumOfContributionAmount} {raisedTokenSymbol.toUpperCase()}
              </chakra.span>
              {inputValue > 0 && (
                <chakra.span fontSize={"sm"} ml={1}>
                  (New contribution:
                  <chakra.span fontWeight={"bold"} ml={2}>
                    {inputtingValueInFormat} {raisedTokenSymbol.toUpperCase()}
                  </chakra.span>
                  )
                </chakra.span>
              )}
            </chakra.div>
          </Flex>
        ) : (
          !isClaimed && (
            <Flex justifyContent={"space-between"}>
              <div>{t("YOUR_CONTRIBUTED_AMOUNT")}</div>
              <chakra.div textAlign={"right"}>
                <chakra.p fontWeight={"bold"}>
                  {fixedContributionAmount} {raisedTokenSymbol.toUpperCase()}
                </chakra.p>
              </chakra.div>
            </Flex>
          )
        )}
      </Stack>
    </Box>
  );
}

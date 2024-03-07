import { chakra, Heading, BoxProps, useToken, Tooltip } from "@chakra-ui/react";
import { Circle } from "rc-progress";
import Big, { divide } from "lib/utils/bignumber";
import {
  getTargetPercetage,
  getFiatConversionAmount,
  etherAmountFormat,
  formatEther,
} from "lib/utils";
import { TriangleUpIcon } from "@chakra-ui/icons";
import { useLocale } from "../../../hooks/useLocale";

type Props = {
  totalRaised: Big;
  allocatedAmount: Big;
  minRaisedAmount: Big;
  targetTotalRaised: Big;
  maximumTotalRaised: Big;
  raisedTokenSymbol: string;
  raisedTokenDecimal: number;
  tokenSymbol: string;
  fiatSymbol: string;
  fiatRate: number;
  contractAddress: string;
  started: boolean;
};

export default function StatisticsInCircle({
  totalRaised,
  allocatedAmount,
  minRaisedAmount,
  targetTotalRaised,
  maximumTotalRaised,
  raisedTokenSymbol,
  raisedTokenDecimal,
  tokenSymbol,
  fiatSymbol,
  fiatRate,
  contractAddress,
  started,
  ...boxProps
}: Props & BoxProps) {
  const [gray600, green400] = useToken("colors", ["gray.600", "green.400"]);

  const progressPercent = getTargetPercetage(totalRaised, maximumTotalRaised);
  const minimumPercent = getTargetPercetage(minRaisedAmount, maximumTotalRaised);
  const targetTotalRaisedPercent = getTargetPercetage(targetTotalRaised, maximumTotalRaised);
  const { t } = useLocale();

  return (
    <chakra.div {...boxProps}>
      <chakra.div position={"relative"}>
        {started && (
          <Tooltip
            hasArrow
            label={
              <chakra.p textAlign={"center"} p={1}>
                Minimum: {etherAmountFormat(minRaisedAmount)}ETH
                {totalRaised.gte(minRaisedAmount) && (
                  <>
                    <br /> {t("ACHIEVED")}
                  </>
                )}
              </chakra.p>
            }
          >
            <TriangleUpIcon
              position={"absolute"}
              zIndex={10}
              transform={`rotate(${(minimumPercent * 360) / 100}deg)`}
              left={`calc(${
                ((Math.sin((minimumPercent / 100) * (2 * Math.PI)) + 1) * 100) / 2
              }% - 8px - ${Math.sin((minimumPercent / 100) * (2 * Math.PI)) * 5.1}%)`} // 5.1 is used for adjusting position of arrow. TODO: move it to util
              bottom={`calc(${
                ((Math.cos((minimumPercent / 100) * (2 * Math.PI)) + 1) * 100) / 2
              }% - 8px - ${Math.cos((minimumPercent / 100) * (2 * Math.PI)) * 5.1}%)`}
            />
          </Tooltip>
        )}
        {started && (
          <Tooltip
            hasArrow
            label={
              <chakra.p textAlign={"center"} p={1}>
                {t("TARGET_TOTAL_RAISED")}: {etherAmountFormat(targetTotalRaised)}
                ETH
                {totalRaised.gte(targetTotalRaised) && (
                  <>
                    <br /> {t("ACHIEVED")}
                  </>
                )}
              </chakra.p>
            }
          >
            <TriangleUpIcon
              position={"absolute"}
              zIndex={10}
              transform={`rotate(${(targetTotalRaisedPercent * 360) / 100}deg)`}
              left={`calc(${
                ((Math.sin((targetTotalRaisedPercent / 100) * (2 * Math.PI)) + 1) * 100) / 2
              }% - 8px - ${Math.sin((targetTotalRaisedPercent / 100) * (2 * Math.PI)) * 5.1}%)`}
              bottom={`calc(${
                ((Math.cos((targetTotalRaisedPercent / 100) * (2 * Math.PI)) + 1) * 100) / 2
              }% - 8px - ${Math.cos((targetTotalRaisedPercent / 100) * (2 * Math.PI)) * 5.1}%)`}
            />
          </Tooltip>
        )}
        <Circle
          percent={progressPercent}
          // percent={[getTargetPercetage(totalRaised, maximumTotalRaised) / 3, getTargetPercetage(totalRaised, maximumTotalRaised) / 3, getTargetPercetage(totalRaised, maximumTotalRaised) / 3]}
          strokeWidth={4}
          trailWidth={4}
          // strokeLinecap="square"
          strokeColor={green400}
          trailColor={gray600}
        />
        <chakra.div
          textAlign={"center"}
          position={"absolute"}
          margin={"auto"}
          top={0}
          bottom={0}
          left={0}
          right={0}
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
        >
          <Heading as={"h3"} fontSize={"lg"}>
            {t("TOTAL_RAISED")}
          </Heading>
          <chakra.div>
            <>
              <chakra.span fontSize={"3xl"}>
                {started ? etherAmountFormat(totalRaised) : "????"}{" "}
              </chakra.span>
              {raisedTokenSymbol.toUpperCase()}
            </>
          </chakra.div>
          <chakra.span mt={"-1"} color={"gray.400"}>
            ≒
            {
              // TODO Fiat symbol ($, ¥)
              " $"
            }
            {started && fiatRate > 0
              ? "" + getFiatConversionAmount(Number(formatEther(totalRaised)), fiatRate).toFixed(2)
              : " - "}
          </chakra.span>
          <div>
            {!!targetTotalRaised && (
              <chakra.div textAlign={"center"} mt={2} color={"gray.400"}>
                {t("TARGET_TOTAL_RAISED")} {etherAmountFormat(targetTotalRaised)}
                {raisedTokenSymbol.toUpperCase()}
                {totalRaised.gte(targetTotalRaised) && started && (
                  <chakra.span textAlign={"center"}> 🎉</chakra.span>
                )}
              </chakra.div>
            )}
            {/* {
            !!maximumTotalRaised && 
              <chakra.div textAlign={'center'}>
                FINAL GOAL {tokenAmountFormat(maximumTotalRaised, 18, 2)}
                {raisedTokenSymbol.toUpperCase()}
                { 
                  totalRaised.gte(maximumTotalRaised) && started && 
                  <chakra.span textAlign={'center'}> 🎉</chakra.span>
                }
              </chakra.div>
            } */}
          </div>
        </chakra.div>
      </chakra.div>
    </chakra.div>
  );
}

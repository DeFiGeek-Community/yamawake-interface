import { useEffect, useState } from "react";
import { Box, chakra, BoxProps, Flex, Tag, Text } from "@chakra-ui/react";
import { getCountdown } from "lib/utils";
import { useLocale } from "../../hooks/useLocale";
import { useNow } from "../../hooks/useNow";

export default function AuctionCardCountdown({
  startingAt,
  closingAt,
  ...props
}: { startingAt: number; closingAt: number } & BoxProps) {
  const { t } = useLocale();
  const [stage, setStage] = useState<"0" | "1" | "2">("0");
  const [countdown, setCountdown] = useState({
    days: "0",
    hours: "00",
    mins: "00",
    secs: "00",
  });
  const [now] = useNow();

  useEffect(() => {
    let currentStage = stage;
    if (now < startingAt) {
      currentStage = "0";
      setCountdown(getCountdown(startingAt - now));
    } else if (now >= startingAt && now < closingAt) {
      currentStage = "1";
      setCountdown(getCountdown(closingAt - now));
    } else if (now >= closingAt) {
      currentStage = "2";
    }

    setStage(currentStage);
  }, [now]);

  return (
    <Flex {...props}>
      {stage === "0" && (
        <>
          <Tag>
            <Box boxSize="1em" bg="gray.500" borderRadius={"100%"} />{" "}
            <Text ml={1}>{t("NOT_STARTED")}</Text>
          </Tag>
          <Box ml={2}>
            <chakra.span fontSize={"sm"}>{t("STARTS_IN")}</chakra.span>{" "}
            <chakra.span fontSize={"xl"}>
              {t("DAYS_AND_TIME", {
                day: countdown.days,
                time: `${countdown.hours}:${countdown.mins}:${countdown.secs}`,
              })}
            </chakra.span>
          </Box>
        </>
      )}
      {stage === "1" && (
        <>
          <Tag>
            <Box boxSize="1em" bg="green.300" borderRadius={"100%"} />{" "}
            <Text ml={1}>{t("LIVE")}</Text>
          </Tag>
          <Box ml={2}>
            <chakra.span fontSize={"sm"}>{t("ENDS_IN")}</chakra.span>{" "}
            <chakra.span fontSize={"xl"}>
              {t("DAYS_AND_TIME", {
                day: countdown.days,
                time: `${countdown.hours}:${countdown.mins}:${countdown.secs}`,
              })}
            </chakra.span>
          </Box>
        </>
      )}
      {stage === "2" && (
        <>
          <Tag>
            <Box boxSize="1em" bg="red.300" borderRadius={"100%"} />{" "}
            <Text ml={1}>{t("ENDED")}</Text>
          </Tag>
        </>
      )}
    </Flex>
  );
}

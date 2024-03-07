import { format } from "date-fns";
import { Circle } from "rc-progress";
import { chakra, BoxProps, useToken } from "@chakra-ui/react";
import CountdownCalendar from "./CountdownCalendar";
import { useLocale } from "../../../hooks/useLocale";

type Props = {
  unixStartDate: number;
  unixEndDate: number;
};

export default function CalendarInCircle({
  unixStartDate,
  unixEndDate,
  ...boxProps
}: Props & BoxProps) {
  function getRestTermPercetage() {
    const now = Math.floor(Date.now() / 1000);
    const duration = unixEndDate - unixStartDate;
    const rest = now - unixStartDate;
    return rest > 0 ? Math.min(100, (rest / duration) * 100) : 0;
  }

  const [gray600, green400] = useToken("colors", ["gray.600", "green.400"]);
  const { t } = useLocale();

  return (
    <chakra.div {...boxProps}>
      <chakra.div position={"relative"}>
        <Circle
          percent={getRestTermPercetage()}
          strokeWidth={4}
          trailWidth={4}
          // strokeLinecap="square"
          strokeColor={green400}
          trailColor={gray600}
        />

        {unixStartDate * 1000 > Date.now() ? (
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
            <chakra.p>
              {t("STARTING_AT", {
                datetime: format(unixStartDate * 1000, "yyyy/MM/dd HH:mm(z)"),
              })}
            </chakra.p>
          </chakra.div>
        ) : (
          <chakra.div
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
            <CountdownCalendar unixEndDate={unixEndDate}></CountdownCalendar>
          </chakra.div>
        )}
      </chakra.div>
    </chakra.div>
  );
}

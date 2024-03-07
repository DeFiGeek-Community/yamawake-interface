import { chakra, ChakraProps, useColorModeValue } from "@chakra-ui/react";

interface StepParams {
  number: number;
  label: number | string;
}

const Steps = ({
  stepParams,
  currentStep,
  ...props
}: {
  stepParams: StepParams[];
  currentStep: number;
} & ChakraProps) => {
  return (
    <chakra.div w={"full"} display="flex" justifyContent={"space-between"} {...props}>
      {stepParams.map((param: StepParams) => (
        <Step key={param.number} currentStep={currentStep} {...param} />
      ))}
    </chakra.div>
  );
};

const Step = ({
  number,
  label,
  currentStep,
}: {
  number: number;
  label: number | string;
  currentStep: number;
}) => {
  const activeColor = "green.400";
  const inactiveColor = useColorModeValue(`gray.500`, `gray.700`);

  return (
    <chakra.div
      display={"flex"}
      flexDirection={{ base: "column", md: "row" }}
      flex={{ base: 1, md: "1 0 auto" }}
      alignItems={"center"}
      role="group"
      _after={{
        content: '""',
        display: "block",
        mx: 4,
        h: "2px",
        flex: "1 1 0%",
        bgColor: currentStep > number ? activeColor : inactiveColor,
      }}
      _last={{ _after: { display: "none" }, flex: { base: 1, md: "0 0 auto" } }}
    >
      <chakra.div minW={"8rem"} display={"flex"} flexDirection={"column"} alignItems={"center"}>
        <chakra.div
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          bgColor={currentStep > number ? activeColor : inactiveColor}
          border={currentStep === number ? "solid 2px" : ""}
          borderColor={currentStep === number ? activeColor : "transparent"}
          outlineOffset={"1px"}
          h={{ base: 30, sm: 30, md: 30 }}
          w={{ base: 30, sm: 30, md: 30 }}
          borderRadius={"full"}
          fontWeight={"bold"}
          color={"white"}
        >
          {number}
        </chakra.div>
        <chakra.p
          ml={{ base: 0, md: 2 }}
          mt={{ base: 2, md: 0 }}
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight={currentStep === number ? "bold" : "normal"}
        >
          {label}
        </chakra.p>
      </chakra.div>
    </chakra.div>
  );
};

export { Step, Steps };

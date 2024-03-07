import {
  chakra,
  Button,
  Flex,
  Tooltip,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";
import { FormikProps } from "formik";
import { useWaitForTransaction } from "wagmi";
import { MetaData } from "lib/types/Auction";
import { SAMPLE_DISCLAIMERS } from "lib/constants";
import { useLocale } from "../../../hooks/useLocale";

export default function MetaDataForm({
  formikProps,
  waitFn,
  onSkip,
}: {
  formikProps: FormikProps<MetaData>;
  waitFn?: ReturnType<typeof useWaitForTransaction>;
  onSkip?: () => void;
}) {
  const { t } = useLocale();
  return (
    <div>
      <form onSubmit={formikProps.handleSubmit}>
        <HStack spacing={8} alignItems={"start"}>
          <chakra.div w={"50%"}>
            <FormControl isInvalid={!!formikProps.errors.id && !!formikProps.touched.id}>
              <FormLabel htmlFor="id" alignItems={"baseline"}>
                {t("SALE_CONTRACT_ADDRESS")}
                <Tooltip hasArrow label={t("THE_ADDRESS_OF_THE_SALE_CONTRACT")}>
                  <QuestionIcon mb={1} ml={1} />
                </Tooltip>
              </FormLabel>
              <HStack>
                <Input
                  isReadOnly={true}
                  isDisabled={true}
                  fontSize={"sm"}
                  id="id"
                  name="id"
                  onBlur={formikProps.handleBlur}
                  onChange={formikProps.handleChange}
                  value={formikProps.values.id}
                  placeholder={
                    waitFn && (waitFn.isLoading || waitFn.isIdle)
                      ? t("WAITING_FOR_THE_TRANSACTION_TO_BE_CONFIRMED")
                      : ""
                  }
                />
                {waitFn && (waitFn.isLoading || waitFn.isIdle) && <Spinner />}
              </HStack>
              <FormErrorMessage>{formikProps.errors.id}</FormErrorMessage>
            </FormControl>

            <FormControl
              mt={4}
              isInvalid={!!formikProps.errors.title && !!formikProps.touched.title}
            >
              <FormLabel htmlFor="title" alignItems={"baseline"}>
                {t("TITLE")}
                <Tooltip hasArrow label={t("INPUT_THE_TITLE_OF_THIS_SALE")}>
                  <QuestionIcon mb={1} ml={1} />
                </Tooltip>
              </FormLabel>
              <Input
                id="title"
                name="title"
                maxLength={100}
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                value={formikProps.values.title}
                placeholder={t("DFGC_DONATION_EVENT")}
              />
              <FormErrorMessage>{formikProps.errors.title}</FormErrorMessage>
            </FormControl>

            <FormControl
              mt={4}
              isInvalid={!!formikProps.errors.description && !!formikProps.touched.description}
            >
              <FormLabel alignItems={"baseline"}>
                {t("DESCRIPTION")}
                <Tooltip hasArrow label={t("INPUT_THE_DESCRIPTION_OF_THIS_SALE")}>
                  <QuestionIcon mb={1} ml={1} />
                </Tooltip>
              </FormLabel>
              <Flex alignItems={"center"}>
                <Textarea
                  id="description"
                  name="description"
                  maxLength={1000}
                  onBlur={formikProps.handleBlur}
                  onChange={formikProps.handleChange}
                  value={formikProps.values.description}
                  placeholder="Explain your event"
                ></Textarea>
              </Flex>
              <FormErrorMessage>{formikProps.errors.description}</FormErrorMessage>
            </FormControl>

            <FormControl
              mt={4}
              isInvalid={!!formikProps.errors.terms && !!formikProps.touched.terms}
            >
              <FormLabel alignItems={"baseline"}>
                {t("DISCLAIMERS_TERMS_AND_CONDITIONS")}
                <Tooltip hasArrow label={t("INPUT_THE_DISCLAIMER")}>
                  <QuestionIcon mb={1} ml={1} />
                </Tooltip>
              </FormLabel>
              <Textarea
                id="terms"
                name="terms"
                maxLength={2000}
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                value={formikProps.values.terms}
                placeholder=""
              ></Textarea>
              <Button
                colorScheme={"blue"}
                size={"xs"}
                mt={1}
                onClick={() => formikProps.setFieldValue("terms", SAMPLE_DISCLAIMERS)}
              >
                {t("USE_SAMPLE_DISCLAIMER_TEXT")}
              </Button>
              <FormErrorMessage>{formikProps.errors.terms}</FormErrorMessage>
            </FormControl>

            <FormControl
              mt={4}
              isInvalid={
                !!formikProps.errors.targetTotalRaised && !!formikProps.touched.targetTotalRaised
              }
            >
              <FormLabel alignItems={"baseline"}>
                {t("TARGET_TOTAL_RAISED")}
                <Tooltip hasArrow label={t("SET_THE_TARGET_AMOUNT")}>
                  <QuestionIcon mb={1} ml={1} />
                </Tooltip>
              </FormLabel>
              <Flex alignItems={"center"}>
                <NumberInput
                  flex="1"
                  name="targetTotalRaised"
                  value={formikProps.values.targetTotalRaised}
                  step={0.01}
                  precision={2}
                  min={0}
                  max={10000000}
                  onBlur={formikProps.handleBlur}
                  onChange={(strVal: string, val: number) =>
                    formikProps.setFieldValue(
                      "targetTotalRaised",
                      strVal && Number(strVal) === val ? strVal : isNaN(val) ? 0 : val,
                    )
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <chakra.div px={2}>ETH</chakra.div>
              </Flex>
              <FormErrorMessage>{formikProps.errors.targetTotalRaised}</FormErrorMessage>
            </FormControl>

            <FormControl
              mt={4}
              isInvalid={
                !!formikProps.errors.maximumTotalRaised && !!formikProps.touched.maximumTotalRaised
              }
            >
              <FormLabel alignItems={"baseline"}>
                {t("MAXIMUM_TOTAL_RAISED")}
                <Tooltip hasArrow label={t("SET_THE_MAXIMUM_TOTAL_RAISED")}>
                  <QuestionIcon mb={1} ml={1} />
                </Tooltip>
              </FormLabel>
              <Flex alignItems={"center"}>
                <NumberInput
                  flex="1"
                  name="maximumTotalRaised"
                  value={formikProps.values.maximumTotalRaised}
                  step={0.01}
                  precision={2}
                  min={0}
                  max={10000000}
                  onBlur={formikProps.handleBlur}
                  onChange={(strVal: string, val: number) =>
                    formikProps.setFieldValue(
                      "maximumTotalRaised",
                      strVal && Number(strVal) === val ? strVal : isNaN(val) ? 0 : val,
                    )
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <chakra.div px={2}>ETH</chakra.div>
              </Flex>
              <FormErrorMessage>{formikProps.errors.maximumTotalRaised}</FormErrorMessage>
            </FormControl>
          </chakra.div>

          <chakra.div w={"50%"}>
            <FormControl
              mt={{ base: 4, md: 0 }}
              isInvalid={!!formikProps.errors.projectURL && !!formikProps.touched.projectURL}
            >
              <FormLabel htmlFor="projectURL" alignItems={"baseline"}>
                {t("PROJECT_URL")}
                <Tooltip hasArrow label={t("INPUT_YOUR_PROJECT_URL_IF_YOU_HAVE_IT")}>
                  <QuestionIcon mb={1} ml={1} />
                </Tooltip>
              </FormLabel>
              <Input
                id="projectURL"
                name="projectURL"
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                value={formikProps.values.projectURL}
                placeholder="e.g. https://xxx.xyz"
              />
              <FormErrorMessage>{formikProps.errors.projectURL}</FormErrorMessage>
            </FormControl>

            <FormControl
              mt={4}
              isInvalid={!!formikProps.errors.logoURL && !!formikProps.touched.logoURL}
            >
              <FormLabel htmlFor="logoURL" alignItems={"baseline"}>
                {t("PROJECT_LOGO_URL")}
                <Tooltip hasArrow label={t("INPUT_YOUR_PROJECT_LOGO_URL_IF_YOU_HAVE_IT")}>
                  <QuestionIcon mb={1} ml={1} />
                </Tooltip>
              </FormLabel>
              <Input
                id="logoURL"
                name="logoURL"
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                value={formikProps.values.logoURL}
                placeholder="e.g. https://xxx.xyz/logo.png"
              />
              <FormErrorMessage>{formikProps.errors.logoURL}</FormErrorMessage>
            </FormControl>

            <FormControl
              mt={4}
              isInvalid={!!formikProps.errors.otherURL && !!formikProps.touched.otherURL}
            >
              <FormLabel htmlFor="otherURL" alignItems={"baseline"}>
                {t("OTHER_URL")}
                <Tooltip hasArrow label={t("INPUT_ANY_URL_IF_YOU_WANT_TO_SHOW_SOMETHING_TO_USERS")}>
                  <QuestionIcon mb={1} ml={1} />
                </Tooltip>
              </FormLabel>
              <Input
                id="otherURL"
                name="otherURL"
                onBlur={formikProps.handleBlur}
                onChange={formikProps.handleChange}
                value={formikProps.values.otherURL}
                placeholder="e.g. https://twitter.com/xxx"
              />
              <FormErrorMessage>{formikProps.errors.otherURL}</FormErrorMessage>
            </FormControl>
          </chakra.div>
        </HStack>

        <HStack mt={8} alignItems={"center"}>
          <Button
            flex={2}
            variant="solid"
            colorScheme="blue"
            type="submit"
            isLoading={formikProps.isSubmitting}
            isDisabled={waitFn && (waitFn.isLoading || waitFn.isIdle)}
            leftIcon={waitFn && (waitFn.isLoading || waitFn.isIdle) ? <Spinner /> : undefined}
          >
            {waitFn && (waitFn.isLoading || waitFn.isIdle)
              ? t("PLEASE_WAIT_FOR_THE_TRANSACTION_TO_BE_CONFIRMED")
              : t("SAVE_SALE_INFORMATION")}
          </Button>
          {onSkip && (
            <Button
              flex={1}
              variant="outline"
              colorScheme="blue"
              onClick={onSkip}
              isDisabled={formikProps.isSubmitting}
            >
              {t("SKIP")}
            </Button>
          )}
        </HStack>
      </form>
    </div>
  );
}

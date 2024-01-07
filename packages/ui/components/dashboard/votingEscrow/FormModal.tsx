import { useFormik } from "formik";
import {
  Button,
  HStack,
  Flex,
  chakra,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormLabel,
  Tooltip,
  FormErrorMessage,
  FormControl,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
  NumberInputStepper,
  NumberDecrementStepper,
  useColorMode,
  Grid,
  GridItem,
  useToast,
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";
import { useContractRead, erc20ABI, useNetwork } from "wagmi";
import { DatePicker, CustomProvider } from "rsuite";
import { jaJP, enUS } from "rsuite/locales";
import { format, addYears, addWeeks, addMonths, addDays } from "date-fns";
import { tokenAmountFormat, getStartOfDayInUTC, getRoundedWeekTimestamp } from "lib/utils";
import { LockType } from "lib/types/VotingEscrow";
import Big, { multiply } from "lib/utils/bignumber";
import TxSentToast from "../../shared/TxSentToast";
import { useLocale } from "../../../hooks/useLocale";
import useLock from "../../../hooks/VotingEscrow/useLock";
import useApprove from "../../../hooks/useApprove";
import "rsuite/dist/rsuite-no-reset.min.css";
import "assets/css/rsuite-override.css";

type FormModalProps = {
  address?: `0x${string}`;
  type: LockType;
  isOpen: boolean;
  onClose: () => void;
};

type LockFormValues = {
  value: number;
  unlockTime: number | null;
};

export default function FormModal({ address, type, isOpen, onClose }: FormModalProps) {
  const { t, locale } = useLocale();
  const { colorMode } = useColorMode();
  const { chain } = useNetwork();
  const toast = useToast({ position: "top-right", isClosable: true });
  const initData: LockFormValues = {
    value: 0,
    unlockTime: null,
  };
  const handleSubmit = () => {};
  const validateLockForm = (value: LockFormValues) => {
    const errors: any = {};
    if (
      typeof balance === "bigint" &&
      Big(balance.toString()).lt(Big(value.value).mul(Big(1e18)))
    ) {
      errors.value = `Not enough balance`;
    }
    return errors;
  };
  const formikProps = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: initData,
    onSubmit: handleSubmit,
    validate: (value: LockFormValues) => validateLockForm(value),
  });

  const approvals = useApprove({
    targetAddress: process.env.NEXT_PUBLIC_YMWK_ADDRESS as `0x${string}`,
    owner: address as `0x${string}`,
    spender: process.env.NEXT_PUBLIC_VE_ADDRESS as `0x${string}`,
    onSuccessWrite(data) {
      toast({
        title: t("TRANSACTION_SENT"),
        status: "success",
        duration: 5000,
        render: (props) => <TxSentToast txid={data.hash} {...props} />,
      });
    },
    onSuccessConfirm(data) {
      toast({
        title: t("APPROVAL_CONFIRMED"),
        status: "success",
        duration: 5000,
      });
    },
    enabled: !!address && (type === LockType.CREATE_LOCK || type === LockType.INCREASE_AMOUNT),
  });

  const { data: balance } = useContractRead({
    address: process.env.NEXT_PUBLIC_YMWK_ADDRESS as `0x${string}`,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    enabled: !!address,
  });

  const { writeFn, waitFn } =
    type === LockType.CREATE_LOCK
      ? useLock({
          type: type,
          value: Big(formikProps.values.value).mul(1e18),
          unlockTime: formikProps.values.unlockTime ? formikProps.values.unlockTime / 1000 : null,
          onSuccessWrite(data) {
            toast({
              title: t("TRANSACTION_SENT"),
              status: "success",
              duration: 5000,
              render: (props) => <TxSentToast txid={data.hash} {...props} />,
            });
            onClose();
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
        })
      : useLock({
          type: type,
          value: Big(formikProps.values.value).mul(1e18),
          unlockTime: formikProps.values.unlockTime ? formikProps.values.unlockTime / 1000 : null,
          onSuccessWrite(data) {
            toast({
              title: t("TRANSACTION_SENT"),
              status: "success",
              duration: 5000,
              render: (props) => <TxSentToast txid={data.hash} {...props} />,
            });
            onClose();
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
    <>
      <CustomProvider theme={colorMode} locale={locale === "ja" ? jaJP : enUS}>
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          closeOnOverlayClick={false}
          blockScrollOnMount={false}
          isCentered={true}
          size={"xs"}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {type === LockType.CREATE_LOCK && t("CREATE_LOCK")}
              {type === LockType.INCREASE_AMOUNT && t("INCREASE_AMOUNT")}
              {type === LockType.INCREASE_UNLOCK_TIME && t("INCREASE_UNLOCK_TIME")}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <form onSubmit={formikProps.handleSubmit}>
                {(type === LockType.CREATE_LOCK || type === LockType.INCREASE_AMOUNT) && (
                  <HStack spacing={8} alignItems={"start"}>
                    <chakra.div w={"full"}>
                      <FormControl
                        mt={4}
                        isInvalid={!!formikProps.errors.value && !!formikProps.touched.value}
                      >
                        <Flex justifyContent={"space-between"}>
                          <FormLabel alignItems={"baseline"}>
                            {t("ALLOCATION_TO_THE_SALE")}
                            <Tooltip
                              hasArrow
                              label={t("INPUT_THE_AMOUNT_OF_TOKENS_TO_BE_ALLOCATED")}
                            >
                              <QuestionIcon mb={1} ml={1} />
                            </Tooltip>
                          </FormLabel>
                        </Flex>

                        <Flex alignItems={"center"}>
                          <NumberInput
                            flex="1"
                            name="value"
                            value={formikProps.values.value}
                            min={0}
                            max={Number.MAX_SAFE_INTEGER}
                            onBlur={formikProps.handleBlur}
                            onChange={(strVal: string, val: number) =>
                              formikProps.setFieldValue(
                                "value",
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
                          <chakra.div px={2} minW={"3rem"}>
                            YMWK
                          </chakra.div>
                        </Flex>
                        <chakra.p color={"gray.400"} fontSize={"sm"}>
                          {t("BALANCE")}: {balance ? tokenAmountFormat(balance, 18, 2) : "0"} YMWK
                        </chakra.p>
                        <FormErrorMessage fontSize={"xs"}>
                          {formikProps.errors.value}
                        </FormErrorMessage>
                      </FormControl>
                    </chakra.div>
                  </HStack>
                )}

                {(type === LockType.CREATE_LOCK || type === LockType.INCREASE_UNLOCK_TIME) && (
                  <FormControl
                    mt={4}
                    isInvalid={!!formikProps.errors.unlockTime && !!formikProps.touched.unlockTime}
                  >
                    <FormLabel alignItems={"baseline"}>
                      {t("START_DATE_END_DATE")}
                      <Tooltip hasArrow label={t("INPUT_THE_DURATION_OF_THE_TOKEN_SALE")}>
                        <QuestionIcon mb={1} ml={1} />
                      </Tooltip>
                    </FormLabel>
                    <Flex alignItems={"center"}>
                      <chakra.div>
                        <DatePicker
                          onEnter={() => {
                            formikProps.setTouched({ unlockTime: true });
                            setTimeout(formikProps.validateForm, 200);
                          }}
                          onBlur={(value: any) => {
                            setTimeout(formikProps.validateForm, 200);
                          }}
                          onChangeCalendarDate={(value) => {
                            if (!value) return;
                            const unlockTime: Date = value;
                            formikProps.setFieldValue("unlockTime", unlockTime.getTime());
                            setTimeout(formikProps.validateForm, 200);
                          }}
                          oneTap={true}
                          format="yyyy-MM-dd"
                          placement="topStart"
                          cleanable={false}
                          defaultValue={
                            formikProps.values.unlockTime
                              ? new Date(formikProps.values.unlockTime)
                              : null
                          }
                          value={
                            formikProps.values.unlockTime
                              ? new Date(formikProps.values.unlockTime)
                              : null
                          }
                          shouldDisableDate={(date: Date) =>
                            getStartOfDayInUTC(date) % (3600 * 24 * 7) !== 0 ||
                            date.getTime() < new Date().getTime() ||
                            date.getTime() > addYears(new Date(), 4).getTime()
                          }
                        />
                      </chakra.div>
                      <chakra.span fontSize={"sm"} ml={2}>
                        ({format(0, "z")})
                      </chakra.span>
                    </Flex>
                    <Grid
                      mt={2}
                      templateRows="repeat(2, 1fr)"
                      templateColumns="repeat(3, 1fr)"
                      gap={2}
                    >
                      <GridItem>
                        <Button
                          size="sm"
                          w="full"
                          onClick={() => {
                            formikProps.setFieldValue(
                              "unlockTime",
                              addWeeks(new Date(getRoundedWeekTimestamp()), 1).getTime(),
                            );
                          }}
                        >
                          1 week
                        </Button>
                      </GridItem>
                      <GridItem>
                        <Button
                          size="sm"
                          w="full"
                          onClick={() => {
                            formikProps.setFieldValue(
                              "unlockTime",
                              getRoundedWeekTimestamp(addMonths(new Date(), 1)),
                            );
                          }}
                        >
                          1 month
                        </Button>
                      </GridItem>
                      <GridItem>
                        <Button
                          size="sm"
                          w="full"
                          onClick={() => {
                            formikProps.setFieldValue(
                              "unlockTime",
                              getRoundedWeekTimestamp(addMonths(new Date(), 3)),
                            );
                          }}
                        >
                          3 months
                        </Button>
                      </GridItem>
                      <GridItem>
                        <Button
                          size="sm"
                          w="full"
                          onClick={() => {
                            formikProps.setFieldValue(
                              "unlockTime",
                              getRoundedWeekTimestamp(addMonths(new Date(), 6)),
                            );
                          }}
                        >
                          6 months
                        </Button>
                      </GridItem>
                      <GridItem>
                        <Button
                          size="sm"
                          w="full"
                          onClick={() => {
                            formikProps.setFieldValue(
                              "unlockTime",
                              getRoundedWeekTimestamp(addYears(new Date(), 1)),
                            );
                          }}
                        >
                          1 year
                        </Button>
                      </GridItem>
                      <GridItem>
                        <Button
                          size="sm"
                          w="full"
                          onClick={() => {
                            formikProps.setFieldValue(
                              "unlockTime",
                              getRoundedWeekTimestamp(addYears(new Date(), 4)),
                            );
                          }}
                        >
                          4 years
                        </Button>
                      </GridItem>
                    </Grid>
                    <FormErrorMessage>{formikProps.errors.unlockTime}</FormErrorMessage>
                  </FormControl>
                )}
                {(type === LockType.CREATE_LOCK || type === LockType.INCREASE_AMOUNT) && (
                  <>
                    {approvals.allowance &&
                    Big(approvals.allowance.toString()).gte(
                      multiply(Big(formikProps.values.value.toString()), Big(10).pow(18)),
                    ) ? (
                      <Button
                        mt={4}
                        w={"full"}
                        variant="solid"
                        colorScheme="green"
                        onClick={() => writeFn.write!()}
                        isLoading={writeFn.isLoading || waitFn.isLoading}
                        isDisabled={chain?.unsupported || !writeFn.write || !formikProps.isValid}
                      >
                        {type === LockType.CREATE_LOCK ? t("CREATE_LOCK") : t("INCREASE_AMOUNT")}
                      </Button>
                    ) : (
                      <Button
                        mt={4}
                        w={"full"}
                        variant="solid"
                        colorScheme="blue"
                        onClick={approvals.writeFn.write}
                        isLoading={approvals.writeFn.isLoading || approvals.waitFn.isLoading}
                        isDisabled={
                          chain?.unsupported || !approvals.writeFn.write || !formikProps.isValid
                        }
                      >
                        {t("APPROVE_TOKEN")}
                      </Button>
                    )}
                  </>
                )}
                {type === LockType.INCREASE_UNLOCK_TIME && (
                  <>
                    <Button
                      mt={4}
                      w={"full"}
                      variant="solid"
                      colorScheme="green"
                      onClick={() => writeFn.write!()}
                      isLoading={writeFn.isLoading || waitFn.isLoading}
                      isDisabled={chain?.unsupported || !writeFn.write || !formikProps.isValid}
                    >
                      {t("INCREASE_UNLOCK_TIME")}
                    </Button>
                  </>
                )}
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </CustomProvider>
    </>
  );
}
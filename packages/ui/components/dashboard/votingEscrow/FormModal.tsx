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
import { useContractRead, erc20ABI, useNetwork } from "wagmi";
import { DatePicker, CustomProvider } from "rsuite";
import { jaJP, enUS } from "rsuite/locales";
import { format, addYears, addDays } from "date-fns";
import { tokenAmountFormat, getRoundedWeekTimestamp } from "lib/utils";
import type { SafeComponentProps } from "lib/types";
import { LockType } from "lib/types/VotingEscrow";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";
import Big, { multiply } from "lib/utils/bignumber";
import TxSentToast from "../../shared/TxSentToast";
import { useLocale } from "../../../hooks/useLocale";
import useLock from "../../../hooks/VotingEscrow/useLock";
import useApprove from "../../../hooks/useApprove";
import "rsuite/dist/rsuite-no-reset.min.css";
import "assets/css/rsuite-override.css";

type FormModalProps = SafeComponentProps & {
  type: LockType;
  isOpen: boolean;
  onClose: () => void;
};

type LockFormValues = {
  value: number;
  unlockTime: number | null;
};

export default function FormModal({ account, safeAddress, type, isOpen, onClose }: FormModalProps) {
  const { t, locale } = useLocale();
  const { colorMode } = useColorMode();
  const { chain } = useNetwork();
  const toast = useToast({ position: "top-right", isClosable: true });
  const initData: LockFormValues = {
    value: 0,
    unlockTime: null,
  };
  const buttonOptions = [
    { label: "2 week", days: 14 },
    { label: "1 month", days: 30 },
    { label: "3 months", days: 90 },
    { label: "6 months", days: 180 },
    { label: "1 year", days: 365 },
    { label: "4 years", days: 1460 },
  ];
  const handleSubmit = () => {
    writeFn?.write!();
  };

  const setDaysLater = (days: number) => {
    const newDate = addDays(new Date(), days);
    formikProps.setFieldValue("unlockTime", getRoundedWeekTimestamp(newDate));
  };

  const validateLockForm = (value: LockFormValues) => {
    const errors: any = {};
    if (
      (type === LockType.CREATE_LOCK || type === LockType.INCREASE_AMOUNT) &&
      typeof balance === "bigint" &&
      Big(balance.toString()).lt(Big(value.value).mul(Big(1e18)))
    ) {
      errors.value = `Not enough balance`;
    }
    if (
      (type === LockType.CREATE_LOCK || type === LockType.INCREASE_UNLOCK_TIME) &&
      value.unlockTime &&
      value.unlockTime < new Date().getTime()
    ) {
      errors.unlockTime = `Unlock time should be in the future`;
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
    chainId: Number(chain?.id), // TODO
    targetAddress: chain ? (CONTRACT_ADDRESSES[chain.id].YMWK as `0x${string}`) : "0x",
    owner: safeAddress || account || "0x",
    safeAddress: safeAddress,
    spender: chain ? (CONTRACT_ADDRESSES[chain.id].VOTING_ESCROW as `0x${string}`) : "0x",
    amount: BigInt(formikProps.values.value) * BigInt(1e18),
    onSuccessWrite(data) {
      toast({
        title: safeAddress ? t("SAFE_TRANSACTION_PROPOSED") : t("TRANSACTION_SENT"),
        status: "success",
        duration: 5000,
        render: (props) => <TxSentToast txid={data.hash} {...props} />,
      });
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
        title: t("APPROVAL_CONFIRMED"),
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
    enabled:
      !!account && !!chain && (type === LockType.CREATE_LOCK || type === LockType.INCREASE_AMOUNT),
  });

  const { data: balance } = useContractRead({
    address: chain ? (CONTRACT_ADDRESSES[chain.id].YMWK as `0x${string}`) : "0x",
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [safeAddress || account || "0x"],
    enabled: !!account,
  });

  const { writeFn, waitFn } = useLock({
    account,
    safeAddress,
    type,
    value: BigInt(formikProps.values.value) * BigInt(1e18),
    unlockTime: formikProps.values.unlockTime
      ? Math.floor(formikProps.values.unlockTime / 1000)
      : null,
    allowance: approvals.allowance,
    callbacks: {
      onSuccessWrite(data) {
        toast({
          title: safeAddress ? t("SAFE_TRANSACTION_PROPOSED") : t("TRANSACTION_SENT"),
          status: "success",
          duration: 5000,
          render: (props) => <TxSentToast txid={data.hash} {...props} />,
        });
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
        onClose();
      },
      onErrorConfirm(e) {
        toast({
          description: e.message,
          status: "error",
          duration: 5000,
        });
      },
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
              {type === LockType.CREATE_LOCK && t("VE_CREATE_LOCK")}
              {type === LockType.INCREASE_AMOUNT && t("VE_INCREASE_AMOUNT")}
              {type === LockType.INCREASE_UNLOCK_TIME && t("VE_INCREASE_UNLOCK_TIME")}
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
                          <FormLabel alignItems={"baseline"}>{t("INPUT_LOCK_AMOUNT")}</FormLabel>
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
                          {t("BALANCE")}:{" "}
                          {balance ? tokenAmountFormat(balance.toString(), 18, 2) : "0"} YMWK
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
                    <FormLabel alignItems={"baseline"}>{t("SELECT_UNLOCK_DATE")}</FormLabel>
                    <Flex alignItems={"center"}>
                      <chakra.div>
                        <DatePicker
                          onEnter={async () => {
                            await formikProps.setTouched({ unlockTime: true });
                            await formikProps.validateForm();
                          }}
                          onBlur={async (value: any) => {
                            await formikProps.validateForm();
                          }}
                          onChangeCalendarDate={async (value) => {
                            const unlockTime: Date = value;
                            await formikProps.setFieldValue("unlockTime", unlockTime.getTime());
                            await formikProps.validateForm();
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
                            date.setUTCHours(0, 0, 0, 0) % (3600 * 24 * 7) !== 0 ||
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
                      {buttonOptions.map((option) => (
                        <GridItem key={option.label}>
                          <Button size="sm" w="full" onClick={() => setDaysLater(option.days)}>
                            {option.label}
                          </Button>
                        </GridItem>
                      ))}
                    </Grid>
                    <FormErrorMessage>{formikProps.errors.unlockTime}</FormErrorMessage>
                  </FormControl>
                )}

                {(type === LockType.CREATE_LOCK || type === LockType.INCREASE_AMOUNT) && (
                  <>
                    {Big(approvals.allowance.toString()).gte(
                      multiply(Big(formikProps.values.value.toString()), Big(10).pow(18)),
                    ) ? (
                      <Button
                        mt={4}
                        w={"full"}
                        variant="solid"
                        colorScheme="green"
                        type="submit"
                        isLoading={
                          writeFn.isLoading ||
                          waitFn.isLoading ||
                          (writeFn.isSuccess && waitFn.isIdle)
                        }
                        isDisabled={chain?.unsupported || !writeFn.write || !formikProps.isValid}
                      >
                        {type === LockType.CREATE_LOCK
                          ? t("VE_CREATE_LOCK")
                          : t("VE_INCREASE_AMOUNT")}
                      </Button>
                    ) : (
                      <Button
                        mt={4}
                        w={"full"}
                        variant="solid"
                        colorScheme="blue"
                        onClick={approvals.writeFn.write}
                        isLoading={
                          approvals.writeFn.isLoading ||
                          approvals.waitFn.isLoading ||
                          (approvals.writeFn.isSuccess && approvals.waitFn.isIdle)
                        }
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
                      type="submit"
                      // onClick={() => writeFn.write!()}
                      isLoading={writeFn.isLoading || waitFn.isLoading}
                      isDisabled={chain?.unsupported || !writeFn.write || !formikProps.isValid}
                    >
                      {t("VE_INCREASE_UNLOCK_TIME")}
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

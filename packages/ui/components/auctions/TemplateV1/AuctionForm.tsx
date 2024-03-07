import { useRef } from "react";
import {
  chakra,
  Button,
  Flex,
  Tooltip,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Link,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Stack,
  Divider,
  useToast,
  Textarea,
} from "@chakra-ui/react";
import { ExternalLinkIcon, QuestionIcon, CopyIcon } from "@chakra-ui/icons";
import { DateRangePicker } from "rsuite";
import { differenceInSeconds, format } from "date-fns";
import { ethers } from "ethers";
import { useNetwork } from "wagmi";
import { getDecimalsForView, getEtherscanLink, tokenAmountFormat } from "lib/utils";
import { getChain } from "lib/utils/chain";
import Big, { divide, getBigNumber, multiply } from "lib/utils/bignumber";
import { AuctionForm } from "lib/types/Auction";
import { useLocale } from "../../../hooks/useLocale";
import useAuctionForm from "../../../hooks/TemplateV1/useAuctionForm";
import TxSentToast from "../../shared/TxSentToast";

export default function AuctionForm({
  address,
  onSubmitSuccess,
  onSubmitError,
  onApprovalTxSent,
  onApprovalTxConfirmed,
}: {
  address: `0x${string}`;
  onSubmitSuccess?: (result: any) => void;
  onSubmitError?: (e: Error) => void;
  onApprovalTxSent?: (result: any) => void;
  onApprovalTxConfirmed?: (result: any) => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const containerRef = useRef<HTMLFormElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast({ position: "top-right", isClosable: true });
  const { t } = useLocale();
  const { chain } = useNetwork();

  const {
    formikProps,
    approvals,
    prepareFn,
    writeFn,
    tokenData,
    balance,
    debouncedAuction,
    getEncodedArgs,
    getDecodedArgs,
    getTransactionRawData,
  } = useAuctionForm({
    address: address as `0x${string}`,
    onSubmitSuccess: (result) => {
      onSubmitSuccess
        ? onSubmitSuccess(result)
        : toast({
            title: t("TRANSACTION_SENT"),
            status: "success",
            duration: 5000,
            render: (props) => <TxSentToast txid={result.hash} {...props} />,
          });
    },
    onSubmitError: (e: any) => {
      onSubmitError
        ? onSubmitError
        : toast({
            description: e.message,
            status: "error",
            duration: 5000,
          });
    },
    onApprovalTxSent: (result: any) => {
      onApprovalTxSent
        ? onApprovalTxSent(result)
        : toast({
            title: t("TRANSACTION_SENT"),
            status: "success",
            duration: 5000,
            render: (props) => <TxSentToast txid={result.hash} {...props} />,
          });
    },
    onApprovalTxConfirmed: (result: any) => {
      onApprovalTxConfirmed
        ? onApprovalTxConfirmed(result)
        : toast({
            title: t("APPROVAL_CONFIRMED"),
            status: "success",
            duration: 5000,
          });
    },
  });

  const handleCopy = async () => {
    if (!prepareFn.data)
      return toast({
        description: "Something went wrong",
        status: "error",
        duration: 5000,
      });
    const text = getTransactionRawData(
      debouncedAuction.templateName,
      prepareFn.data.request.args[1],
    );
    await navigator.clipboard.writeText(`${text}`);
    toast({
      description: "Copied!",
      status: "success",
      duration: 2000,
    });
  };

  return (
    <div>
      <form ref={containerRef} onSubmit={formikProps.handleSubmit}>
        <FormControl mt={4} isInvalid={!!formikProps.errors.token && !!formikProps.touched.token}>
          <FormLabel htmlFor="token" alignItems={"baseline"}>
            {t("TOKEN_ADDRESS")}
            <Tooltip
              hasArrow
              label={t("INPUT_THE_ADDRESS_OF_THE_TOKEN_YOU_WOULD_LIKE_TO_ALLOCATE_TO_THIS_SALE")}
            >
              <QuestionIcon mb={1} ml={1} />
            </Tooltip>
          </FormLabel>
          <Input
            id="token"
            name="token"
            onBlur={formikProps.handleBlur}
            onChange={(event: React.ChangeEvent<any>) => {
              formikProps.setFieldTouched("allocatedAmount");
              formikProps.handleChange(event);
            }}
            value={formikProps.values.token ? formikProps.values.token : ""}
            placeholder="e.g. 0x0123456789012345678901234567890123456789"
          />
          <FormErrorMessage>{formikProps.errors.token}</FormErrorMessage>
        </FormControl>

        <chakra.p color={"gray.400"} fontSize={"sm"} mt={1}>
          {t("DONT_HAVE_A_TOKEN_YET")}{" "}
          <Link
            color={"gray.300"}
            href="https://www.smartcontracts.tools/token-generator/ethereum/"
            target="_blank"
          >
            ETHEREUM Token Generator <ExternalLinkIcon />
          </Link>
        </chakra.p>

        <FormControl
          mt={4}
          isInvalid={
            (!!formikProps.errors.startingAt && !!formikProps.touched.startingAt) ||
            (!!formikProps.errors.eventDuration && !!formikProps.touched.eventDuration)
          }
        >
          <FormLabel alignItems={"baseline"}>
            {t("START_DATE_END_DATE")}
            <Tooltip hasArrow label={t("INPUT_THE_DURATION_OF_THE_TOKEN_SALE")}>
              <QuestionIcon mb={1} ml={1} />
            </Tooltip>
          </FormLabel>
          <DateRangePicker
            onEnter={() => {
              formikProps.setTouched({ startingAt: true, eventDuration: true });
              setTimeout(formikProps.validateForm, 200);
            }}
            onBlur={(value: any) => {
              setTimeout(formikProps.validateForm, 200);
            }}
            onChange={(value: any) => {
              if (!value) return;
              const start = value[0];
              const end = value[1];
              if (!start || !end) return;
              const duration = differenceInSeconds(end, start);
              formikProps.setFieldValue("startingAt", start.getTime());
              formikProps.setFieldValue("eventDuration", duration);
              setTimeout(formikProps.validateForm, 200);
            }}
            onOk={(value: any) => {
              if (!value) return;
              const start = value[0];
              const end = value[1];
              if (!start || !end) return;
              const duration = differenceInSeconds(end, start);
              formikProps.setFieldValue("startingAt", start.getTime());
              formikProps.setFieldValue("eventDuration", duration);
              setTimeout(formikProps.validateForm, 200);
            }}
            format="yyyy-MM-dd HH:mm:ss"
            cleanable={false}
            defaultValue={[
              new Date(formikProps.values.startingAt),
              new Date(formikProps.values.startingAt + formikProps.values.eventDuration * 1000),
            ]}
          />
          <chakra.span fontSize={"sm"} ml={2}>
            ({format(0, "z")})
          </chakra.span>
          <FormErrorMessage>{formikProps.errors.startingAt}</FormErrorMessage>
          <FormErrorMessage>{formikProps.errors.eventDuration}</FormErrorMessage>
        </FormControl>

        <FormControl
          mt={4}
          isInvalid={!!formikProps.errors.allocatedAmount && !!formikProps.touched.allocatedAmount}
        >
          <Flex justifyContent={"space-between"}>
            <FormLabel alignItems={"baseline"}>
              {t("ALLOCATION_TO_THE_SALE")}
              <Tooltip hasArrow label={t("INPUT_THE_AMOUNT_OF_TOKENS_TO_BE_ALLOCATED")}>
                <QuestionIcon mb={1} ml={1} />
              </Tooltip>
            </FormLabel>
          </Flex>

          <Flex alignItems={"center"}>
            <NumberInput
              flex="1"
              name="allocatedAmount"
              value={formikProps.values.allocatedAmount}
              min={0}
              max={Number.MAX_SAFE_INTEGER}
              onBlur={formikProps.handleBlur}
              onChange={(strVal: string, val: number) =>
                formikProps.setFieldValue(
                  "allocatedAmount",
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
              {tokenData?.symbol}
            </chakra.div>
          </Flex>
          <chakra.p color={"gray.400"} fontSize={"sm"}>
            {t("BALANCE")}:{" "}
            {balance && tokenData
              ? tokenAmountFormat(
                  Big(balance.toString()),
                  Number(tokenData.decimals),
                  getDecimalsForView(
                    getBigNumber(tokenData.totalSupply.value.toString()),
                    Number(tokenData.decimals),
                  ),
                )
              : "-"}{" "}
            {tokenData?.symbol}
          </chakra.p>
          <FormErrorMessage fontSize={"xs"}>{formikProps.errors.allocatedAmount}</FormErrorMessage>
        </FormControl>

        <FormControl
          mt={4}
          isInvalid={!!formikProps.errors.minRaisedAmount && !!formikProps.touched.minRaisedAmount}
        >
          <FormLabel alignItems={"baseline"}>
            {t("MINIMUM_TOTAL_RAISED")}
            <Tooltip
              hasArrow
              label={t("THE_SALE_WILL_BE_VOID_IF_THE_TOTAL_RAISED_IS_LESS_THAN_THIS_THRESHOLD")}
            >
              <QuestionIcon mb={1} ml={1} />
            </Tooltip>
          </FormLabel>
          <Flex alignItems={"center"}>
            <NumberInput
              flex="1"
              name="minRaisedAmount"
              value={formikProps.values.minRaisedAmount}
              step={0.01}
              min={0}
              max={10000000}
              onBlur={formikProps.handleBlur}
              onChange={(strVal: string, val: number) =>
                formikProps.setFieldValue(
                  "minRaisedAmount",
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
          <chakra.p color={"gray.400"} fontSize={"sm"}>
            {!!tokenData &&
              !!formikProps.values.minRaisedAmount &&
              !!formikProps.values.allocatedAmount &&
              `1 ${tokenData.symbol} = ${divide(
                formikProps.values.minRaisedAmount,
                formikProps.values.allocatedAmount,
              ).toString()} ETH at Minimum total raised`}
          </chakra.p>
          <FormErrorMessage>{formikProps.errors.minRaisedAmount}</FormErrorMessage>
        </FormControl>
        {approvals.allowance &&
        Big(approvals.allowance.toString()).gte(
          multiply(
            Big(formikProps.values.allocatedAmount.toString()),
            Big(10).pow(tokenData ? tokenData.decimals : 0),
          ),
        ) ? (
          <>
            <Button
              mt={8}
              w={"full"}
              variant="solid"
              colorScheme="green"
              isLoading={writeFn.isLoading}
              isDisabled={chain?.unsupported || !writeFn.writeAsync || !formikProps.isValid}
              onClick={onOpen}
            >
              {t("DEPLOY_SALE_CONTRACT")}
            </Button>
            <AlertDialog
              isOpen={isOpen}
              size={"lg"}
              leastDestructiveRef={cancelRef}
              onClose={onClose}
              closeOnOverlayClick={false}
              portalProps={{ containerRef: containerRef }}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    {t("CONFIRMATION")}
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    <Stack spacing={4} divider={<Divider />}>
                      <div>
                        <chakra.p>{t("TEMPLATE")}</chakra.p>
                        <chakra.p fontWeight={"bold"} aria-label="Auction Template">
                          {ethers.decodeBytes32String(debouncedAuction.templateName)}
                        </chakra.p>
                      </div>

                      <div>
                        <chakra.p>{t("TOKEN_ADDRESS")}</chakra.p>
                        <chakra.p fontWeight={"bold"} aria-label="Token address">
                          <Link
                            href={getEtherscanLink(
                              getChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID)).name.toLowerCase(),
                              debouncedAuction.token as `0x${string}`,
                              "token",
                            )}
                            target={"_blank"}
                          >
                            {debouncedAuction.token}
                            <ExternalLinkIcon ml={1} />
                          </Link>
                        </chakra.p>
                      </div>

                      <div>
                        <chakra.p>{t("START_DATE_END_DATE")}</chakra.p>
                        <chakra.p fontWeight={"bold"} aria-label="Start date - End date">
                          <>
                            {format(debouncedAuction.startingAt, "yyyy/MM/dd HH:mm:ss")}
                            {` - `}
                            {format(
                              debouncedAuction.startingAt + debouncedAuction.eventDuration * 1000,
                              "yyyy/MM/dd HH:mm:ss",
                            )}{" "}
                            {format(new Date(), "(z)")}
                          </>
                        </chakra.p>
                      </div>

                      <div>
                        <chakra.p>{t("ALLOCATED_TO_THE_SALE")}</chakra.p>
                        <chakra.p fontWeight={"bold"} aria-label="Allocated to the auction">
                          {tokenData
                            ? Number(debouncedAuction.allocatedAmount).toFixed(
                                getDecimalsForView(
                                  getBigNumber(tokenData?.totalSupply.value.toString()),
                                  tokenData?.decimals,
                                ),
                              )
                            : "-"}{" "}
                          {tokenData?.symbol}
                        </chakra.p>
                      </div>

                      <div>
                        <chakra.p>{t("MINIMUM_TOTAL_RAISED")}</chakra.p>
                        <chakra.p fontWeight={"bold"} aria-label="Minimum total raised">
                          {Number(debouncedAuction.minRaisedAmount).toFixed(2)} ETH
                        </chakra.p>
                      </div>

                      <div>
                        <chakra.p color={"gray.400"} fontSize={"xs"}>
                          {t("RAW_DATA")}
                          <Button ml={1} mb={1} onClick={handleCopy} size={"xs"}>
                            <CopyIcon />
                          </Button>
                        </chakra.p>
                        <Textarea
                          color={"gray.400"}
                          isReadOnly
                          size={"sm"}
                          variant={"filled"}
                          rows={3}
                        >
                          {prepareFn.data &&
                            getTransactionRawData(
                              debouncedAuction.templateName,
                              prepareFn.data.request.args[1],
                            )}
                        </Textarea>
                      </div>
                    </Stack>
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                      {t("CANCEL")}
                    </Button>
                    <Button
                      ml={4}
                      type="submit"
                      variant="solid"
                      colorScheme="green"
                      isLoading={writeFn.isLoading}
                      isDisabled={chain?.unsupported || !writeFn.writeAsync || !formikProps.isValid}
                    >
                      {t("DEPLOY_SALE_CONTRACT")}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </>
        ) : (
          <Button
            mt={8}
            w={"full"}
            variant="solid"
            colorScheme="blue"
            onClick={approvals.writeFn.write}
            isLoading={approvals.writeFn.isLoading || approvals.waitFn.isLoading}
            isDisabled={chain?.unsupported || !approvals.writeFn.write || !formikProps.isValid}
          >
            {t("APPROVE_TOKEN")}
          </Button>
        )}
      </form>
    </div>
  );
}

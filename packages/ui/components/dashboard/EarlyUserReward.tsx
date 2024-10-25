import { useWalletClient } from "wagmi";
import {
  Button,
  useToast,
  Card,
  CardBody,
  Heading,
  Tooltip,
  Divider,
  HStack,
  chakra,
  CardFooter,
  Spinner,
  Text,
  Image,
} from "@chakra-ui/react";
import { useLocale } from "../../hooks/useLocale";
import { QuestionIcon } from "@chakra-ui/icons";
import useEarlyUserReward from "../../hooks/useEarlyUserReward";
import { formatEtherInBig } from "lib/utils";
import { CONTRACT_ADDRESSES } from "lib/constants/contracts";
import { YMWK_LOGO_URL } from "lib/constants";
import TxSentToast from "../shared/TxSentToast";

export default function EarlyUserReward({
  chainId,
  address,
  safeAddress,
}: {
  chainId: number;
  address: `0x${string}` | undefined;
  safeAddress: `0x${string}` | undefined;
}) {
  const toast = useToast({ position: "top-right", isClosable: true });
  const { t } = useLocale();
  const { readFn, writeFn, waitFn } = useEarlyUserReward({
    chainId,
    address,
    safeAddress,
    onSuccessWrite: (data: any) => {
      toast({
        title: safeAddress ? t("SAFE_TRANSACTION_PROPOSED") : t("TRANSACTION_SENT"),
        status: "success",
        duration: 10000,
        render: safeAddress ? undefined : (props) => <TxSentToast txid={data?.hash} {...props} />,
      });
    },
    onErrorWrite: (e: Error) => {
      toast({
        description: e.message,
        status: "error",
        duration: 5000,
      });
    },
    onSuccessConfirm: (data: any) => {
      toast({
        description: t("TRANSACTION_CONFIRMED"),
        status: "success",
        duration: 5000,
      });
    },
  });

  const { data: walletClient } = useWalletClient();
  const addYMWKToWallet = async () => {
    if (walletClient) {
      try {
        await walletClient.watchAsset({
          type: "ERC20",
          options: {
            address: CONTRACT_ADDRESSES[chainId].YMWK,
            symbol: "YMWK",
            decimals: 18,
            image: YMWK_LOGO_URL,
          },
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error("No signer found");
    }
  };

  return (
    <Card flex={1}>
      <CardBody>
        <Heading fontSize={"xl"}>
          {t("EARLY_USER_REWARD")}
          <Tooltip
            hasArrow
            label={<Text whiteSpace={"pre-wrap"}>{t("EARLY_USER_REWARD_HELP")}</Text>}
          >
            <QuestionIcon fontSize={"md"} mb={1} ml={1} />
          </Tooltip>
        </Heading>
        <Divider mt={2} mb={4} />
        <HStack justifyContent={"space-between"}>
          <chakra.div color={"gray.400"}>{t("CLAIMABLE")}</chakra.div>
          <chakra.div fontSize={"2xl"}>
            {readFn.isLoading || typeof readFn.data === "undefined" ? (
              <Spinner />
            ) : (
              formatEtherInBig(readFn.data.toString()).toFixed(3)
            )}
            <chakra.span color={"gray.400"} fontSize={"lg"} ml={1}>
              YMWK
            </chakra.span>
          </chakra.div>
        </HStack>
      </CardBody>
      <CardFooter pt={0} justifyContent={"flex-end"}>
        <Button mr={2} onClick={() => addYMWKToWallet()}>
          <Image
            w={6}
            h={6}
            mr={1}
            src="/logo/yamawake-App-icon/png/64px/yamawake-App-icon-transparent-64×64.png"
          />
          {t("ADD_TOKEN", { symbol: "YMWK" })}
        </Button>
        <Button
          isLoading={
            readFn.isLoading ||
            typeof readFn.data === "undefined" ||
            writeFn?.isLoading ||
            waitFn?.isLoading ||
            (writeFn?.isSuccess && waitFn.isIdle)
          }
          isDisabled={(typeof readFn.data === "bigint" && readFn.data === 0n) || !writeFn.write}
          onClick={() => {
            writeFn.write?.();
          }}
          variant={"solid"}
          colorScheme="green"
        >
          {t("CLAIM")}
        </Button>
      </CardFooter>
    </Card>
  );
}

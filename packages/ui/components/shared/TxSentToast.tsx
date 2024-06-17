import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  chakra,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  ToastProps,
  CloseButton,
  Link,
} from "@chakra-ui/react";
import { getEtherscanLink } from "lib/utils/chain";
import { useAccount } from "wagmi";

export interface TxSentToast extends ToastProps {
  txid: `0x${string}`;
}

export default function TxSentToast(props: TxSentToast) {
  const {
    status,
    variant = "solid",
    id,
    title,
    isClosable,
    onClose,
    description,
    colorScheme,
    icon,
    txid,
  } = props;

  const ids = id
    ? {
        root: `toast-${id}`,
        title: `toast-${id}-title`,
        description: `toast-${id}-description`,
      }
    : undefined;
  const { chain } = useAccount();

  return (
    <Alert
      addRole={false}
      status={status}
      variant={variant}
      id={ids?.root}
      alignItems="start"
      borderRadius="md"
      boxShadow="lg"
      paddingEnd={8}
      textAlign="start"
      width="auto"
      colorScheme={colorScheme}
    >
      <AlertIcon>{icon}</AlertIcon>
      <chakra.div flex="1" maxWidth="100%">
        {title && <AlertTitle id={ids?.title}>{title}</AlertTitle>}
        <AlertDescription display="block">
          {description}
          <Link href={getEtherscanLink(chain, txid, "tx")} target={"_blank"}>
            Etherscan <ExternalLinkIcon ml={1} />
          </Link>
        </AlertDescription>
      </chakra.div>
      {isClosable && (
        <CloseButton size="sm" onClick={onClose} position="absolute" insetEnd={1} top={1} />
      )}
    </Alert>
  );
}

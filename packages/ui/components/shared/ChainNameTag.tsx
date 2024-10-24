import { Image, Tag } from "@chakra-ui/react";
import { getChainById } from "lib/utils/chain";
import { ChainLogo } from "./ChainLogo";

type ChainNameTagType = { chainId: number } & React.ComponentProps<typeof Tag>;

export const ChainNameTag = ({ chainId, ...props }: ChainNameTagType) => {
  const chain = getChainById(chainId);
  return (
    <Tag variant="solid" colorScheme="green" borderRadius="full" {...props}>
      <ChainLogo chainId={chainId} mr={1} h={18} w={18} />
      {chain?.name}
    </Tag>
  );
};

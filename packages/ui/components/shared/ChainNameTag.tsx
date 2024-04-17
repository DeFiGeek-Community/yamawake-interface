import { Image, Tag } from "@chakra-ui/react";
import { getChainById } from "lib/utils/chain";

type ChainNameTagType = { chainId: number } & React.ComponentProps<typeof Tag>;

export const ChainNameTag = ({ chainId, ...props }: ChainNameTagType) => {
  const chain = getChainById(chainId);
  return (
    <Tag variant="solid" colorScheme="teal" borderRadius="full" {...props}>
      <Image
        alt={
          // TODO
          ""
        }
        src={
          // TODO
          ""
        }
      />
      {chain?.name}
    </Tag>
  );
};

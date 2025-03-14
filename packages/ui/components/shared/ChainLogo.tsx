import { Avatar, Image } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";
import { getChainById } from "lib/utils/chain";

export function ChainLogo({ chainId, ...props }: { chainId: number } & BoxProps) {
  const chain = getChainById(chainId);
  const defaultHeight = "20px";
  const defaultWidth = "20px";
  const defaultBorderRadius = "20px";
  const height = props.h ?? defaultHeight;
  const width = props.w ?? defaultWidth;

  const { onError, onLoad, ...avatarProps } = props;

  return (
    <Image
      alt={chain ? chain.name : "?"}
      src={`/images/chainLogos/${chainId}.svg`}
      h={defaultHeight}
      w={defaultWidth}
      borderRadius={defaultBorderRadius}
      fallback={
        <Avatar
          w={width}
          h={height}
          size={"xs"}
          name={chain ? chain.name[0].toUpperCase() : "?"}
          bg="gray.500"
          {...avatarProps}
        />
      }
      {...props}
    />
  );
}

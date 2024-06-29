import { Image } from "@chakra-ui/react";
import type { ImageProps } from "@chakra-ui/react";
import { getChainById } from "lib/utils/chain";

export function ChainLogo({ chainId, ...props }: { chainId: number } & ImageProps) {
  const chain = getChainById(chainId);
  const defaultHeight = "20px";
  const defaultWidth = "20px";
  const defaultBorderRadius = "20px";
  const height = props.h ?? defaultHeight;
  const width = props.w ?? defaultWidth;

  return (
    <Image
      alt={chain ? chain.name : "?"}
      src={`/images/chainLogos/${chainId}.svg`}
      h={defaultHeight}
      w={defaultWidth}
      borderRadius={defaultBorderRadius}
      fallbackSrc={`https://via.placeholder.com/${parseInt(String(width))}x${parseInt(
        String(height),
      )}?text=${chain ? chain.name[0].toUpperCase() : "?"}`}
      {...props}
    />
  );
}

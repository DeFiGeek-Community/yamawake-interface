import { Image, Icon } from "@chakra-ui/react";
import type { LayoutProps, SpaceProps } from "@chakra-ui/react";
import { BiSolidWallet } from "react-icons/bi";
import metamaskLogo from "assets/images/metamask-fox.svg";
import coinbaseLogo from "assets/images/coinbase-wallet-logo.png";
import walletConnectLogo from "assets/images/wallet-connect-logo.png";

const logoMap: { [key: string]: any } = {
  metaMask: metamaskLogo,
  coinbaseWallet: coinbaseLogo,
  walletConnect: walletConnectLogo,
};

export default function ProviderLogo({
  connectorId,
  fontSize,
  ...layoutProps
}: {
  connectorId: string;
  fontSize?: number | string;
} & LayoutProps &
  SpaceProps) {
  return logoMap[connectorId] ? (
    <Image
      alt={connectorId}
      src={logoMap[connectorId] ? logoMap[connectorId].src : ""}
      {...layoutProps}
    />
  ) : (
    <Icon as={BiSolidWallet} color="teal.200" {...layoutProps} fontSize={fontSize} />
  );
}

import { Image, ImageProps } from "@chakra-ui/react";
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
  ...props
}: { connectorId: string } & ImageProps) {
  return (
    <Image
      {...props}
      alt={connectorId}
      src={logoMap[connectorId] ? logoMap[connectorId].src : ""}
    />
  );
}

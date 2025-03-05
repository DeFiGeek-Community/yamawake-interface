import { Chain, configureChains, createConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import { CoinbaseWalletConnector } from "@wagmi/core/connectors/coinbaseWallet";
import { InjectedConnector } from "@wagmi/core/connectors/injected";
import { MetaMaskConnector } from "@wagmi/core/connectors/metaMask";
import { WalletConnectConnector } from "@wagmi/core/connectors/walletConnect";
import { CHAIN_INFO } from "../constants/chains";

const { chains, publicClient, webSocketPublicClient } = configureChains<Chain>(
  Object.values(CHAIN_INFO),
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_TOKEN! }),
    publicProvider(),
  ],
);

const config: any = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new InjectedConnector({
      chains,
      options: {
        name: "Injected Wallet",
        shimDisconnect: true,
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "Yamawake",
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID!,
        qrModalOptions: {
          themeVariables: {
            // Type error Workaround
            // @ts-ignore
            "--wcm-z-index": "2000",
          },
        },
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export default config;

import { Chain, configureChains, createConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";

import { CoinbaseWalletConnector } from "@wagmi/core/connectors/coinbaseWallet";
import { InjectedConnector } from "@wagmi/core/connectors/injected";
import { MetaMaskConnector } from "@wagmi/core/connectors/metaMask";
import { WalletConnectConnector } from "@wagmi/core/connectors/walletConnect";
import { getChain } from "../utils/chain";

function getSupportedChain(): Chain[] {
  return [getChain(Number(process.env.NEXT_PUBLIC_CHAIN_ID))];
}

const { chains, publicClient, webSocketPublicClient } = configureChains<Chain>(
  getSupportedChain(),
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_TOKEN! }),
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
    publicProvider(),
  ],
);

const config: any = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
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
    // new InjectedConnector({
    //   chains,
    //   options: {
    //     name: 'Injected',
    //     shimDisconnect: false,
    //   },
    // }),
  ],
  publicClient,
  webSocketPublicClient,
});

export default config;

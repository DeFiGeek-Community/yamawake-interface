import { createClient, http, fallback, HttpTransport } from "viem";
import { createConfig } from "wagmi";
import { injected, metaMask, coinbaseWallet, walletConnect } from "wagmi/connectors";
import { getSupportedChains } from "../utils/chain";

const chains = getSupportedChains();

const MetaMaskOptions = {
  dappMetadata: {
    name: "Yamawake",
  },
  infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_TOKEN,
};

const config: any = createConfig({
  chains,
  connectors: [
    metaMask(MetaMaskOptions),
    injected({ shimDisconnect: true }),
    coinbaseWallet({ appName: "Yamawake" }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID!,
      qrModalOptions: {
        themeVariables: {
          // Type error Workaround
          // @ts-ignore
          "--wcm-z-index": "2000",
        },
      },
    }),
  ],
  client({ chain }) {
    const rpcEndpoints: HttpTransport[] = [];
    chain.rpcUrls.infura &&
      rpcEndpoints.push(
        http(`${chain.rpcUrls.infura.http[0]}/${process.env.NEXT_PUBLIC_INFURA_API_TOKEN}`),
      );
    chain.rpcUrls.alchemy &&
      rpcEndpoints.push(
        http(`${chain.rpcUrls.alchemy.http[0]}/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
      );
    rpcEndpoints.push(http(`${chain.rpcUrls.public.http[0]}`));

    // For debug
    console.log(rpcEndpoints);

    return createClient({ chain, transport: fallback(rpcEndpoints) });
  },
});

export default config;

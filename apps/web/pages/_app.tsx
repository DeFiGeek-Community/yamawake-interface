import type { AppProps } from "next/app";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { WagmiConfig } from "wagmi";
import theme from "ui/themes";
import config from "lib/connector";
import { CurrentUserProvider } from "ui/components/providers/CurrentUserProvider";
import { RequestedChainProvider } from "ui/components/providers/RequestedChainProvider";
import "assets/css/styles.css";
import Layout from "ui/components/layouts/layout";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <ChakraProvider theme={theme}>
        <RequestedChainProvider>
          <CurrentUserProvider>
            <ColorModeScript initialColorMode={"dark"} />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </CurrentUserProvider>
        </RequestedChainProvider>
      </ChakraProvider>
    </WagmiConfig>
  );
}

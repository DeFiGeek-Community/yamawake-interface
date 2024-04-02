import type { AppProps } from "next/app";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { WagmiConfig } from "wagmi";
import theme from "ui/themes";
import config from "lib/connector";
import { CurrentUserProvider } from "ui/components/providers/CurrentUserProvider";
import { RequestedChainProvider } from "ui/components/providers/RequestedChainProvider";
import "assets/css/styles.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <ChakraProvider theme={theme}>
        <CurrentUserProvider>
          <RequestedChainProvider>
            <ColorModeScript initialColorMode={"dark"} />
            <Component {...pageProps} />
          </RequestedChainProvider>
        </CurrentUserProvider>
      </ChakraProvider>
    </WagmiConfig>
  );
}

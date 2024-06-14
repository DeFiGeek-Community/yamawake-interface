import type { AppProps } from "next/app";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import theme from "ui/themes";
import config from "lib/connector";
import { CurrentUserProvider } from "ui/components/providers/CurrentUserProvider";
import { RequestedChainProvider } from "ui/components/providers/RequestedChainProvider";
import "assets/css/styles.css";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <RequestedChainProvider>
            <CurrentUserProvider>
              <ColorModeScript initialColorMode={"dark"} />
              <Component {...pageProps} />
            </CurrentUserProvider>
          </RequestedChainProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

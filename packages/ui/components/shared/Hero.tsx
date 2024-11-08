import Router from "next/router";
import type { Chain } from "viem/chains";
import { Button, Flex, Heading, Stack, HStack, Image, useToast } from "@chakra-ui/react";
import { KeyedMutator } from "swr";
import { User } from "lib/types";
import SignInButton from "./SignInButton";
import { useLocale } from "../../hooks/useLocale";
import bgImage from "assets/images/background_sky-min.png";

type HeroProps = {
  requestedChain: Chain;
  title?: string;
  subtitle?: string;
  currentUser?: User;
  mutate?: KeyedMutator<User | undefined>;
};

export default function Hero({
  requestedChain,
  title = "Yamawake",
  subtitle = "An inclusive and transparent token launchpad,\n offering a permissionless and fair launch model.",
  currentUser,
  mutate,
  ...rest
}: HeroProps) {
  const toast = useToast({ position: "top-right", isClosable: true });
  const { t, locale } = useLocale();

  return (
    <Flex
      align="center"
      justify={{ base: "center", md: "center", xl: "center" }}
      direction={{ base: "column-reverse", md: "row" }}
      wrap="nowrap"
      minH="50vh"
      px={{ base: 2, md: 8 }}
      mb={16}
      bg={`linear-gradient(rgba(0, 18, 18, .6),  rgba(0, 18, 18, .6)), url("${bgImage.src}")`}
      bgRepeat={"no-repeat"}
      bgSize={"cover"}
      bgPos={"center"}
      {...rest}
    >
      <Stack spacing={{ base: 4, lg: 8 }} w={{ base: "100%", md: "40%" }} align={"center"}>
        <Image
          height={"50px"}
          alt={title}
          src={"/logo/yamawake-lockup/svg/yamawake-lockup-transparent.svg"}
        />
        <Heading
          as="h2"
          size={{ base: "sm", md: "md" }}
          color="primary.800"
          opacity="0.8"
          fontWeight="normal"
          lineHeight={1.5}
          textAlign={"center"}
          whiteSpace={"pre-line"}
        >
          {subtitle}
        </Heading>
        <HStack spacing={4} flexDirection={{ base: "column", md: "row" }}>
          {!currentUser && (
            <SignInButton
              text={t("CREATE_AUCTION")}
              id="sign-in-with-ethereum-hero"
              size={{ base: "md", md: "lg" }}
              onSignInSuccess={async () => {
                mutate && (await mutate());
                Router.push("/dashboard");
              }}
              onSignInError={(error: Error) => {
                toast({
                  description: error.message,
                  status: "error",
                  duration: 5000,
                });
              }}
            />
          )}
          <Button
            size={{ base: "md", md: "lg" }}
            onClick={() => Router.push(`/auctions/${requestedChain.id}`)}
          >
            {t("JOIN_AUCTION")}
          </Button>
        </HStack>
      </Stack>
    </Flex>
  );
}

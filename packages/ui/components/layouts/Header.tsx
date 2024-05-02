import { useState, useContext, useEffect } from "react";
import {
  chakra,
  Tag,
  Box,
  Flex,
  Container,
  Heading,
  Button,
  HStack,
  Avatar,
  Text,
  VStack,
  useToast,
  Divider,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useAccount, useEnsAvatar, useEnsName, useDisconnect } from "wagmi";
import { Chain, switchNetwork, SwitchNetworkArgs } from "@wagmi/core";
import { getLinkPath } from "lib/utils";
import { getSupportedChains, isSupportedChain } from "lib/utils/chain";
import { useLocale } from "../../hooks/useLocale";
import { useRequestedChain } from "../../hooks/useRequestedChain";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import SignInButton from "../shared/SignInButton";
import ProviderLogo from "../shared/ProviderLogo";
import ConnectButton from "../shared/connectButton";
import { ChainLogo } from "../shared/ChainLogo";

type NetworkMenuProps = {
  allowNetworkChange: boolean;
  chain: Chain;
  handleSwitchNetwork: (chain: Chain) => void;
};

function NetworkMenu({ allowNetworkChange, chain, handleSwitchNetwork }: NetworkMenuProps) {
  return (
    <Menu>
      <MenuButton
        disabled={!allowNetworkChange}
        cursor={allowNetworkChange ? "pointer" : "not-allowed"}
      >
        <Tag
          size={"lg"}
          display={{ base: "none", md: "flex" }}
          variant="solid"
          colorScheme={allowNetworkChange ? "teal" : "gray"}
        >
          {!isSupportedChain(chain.id) ? (
            "Unsupported Chain"
          ) : (
            <>
              <ChainLogo chainId={chain.id} mr={1} />
              {chain.name}
            </>
          )}
          {chain.testnet && (
            <Tag ml={2} size={"sm"}>
              Testnet
            </Tag>
          )}
        </Tag>
      </MenuButton>
      <MenuList zIndex={101}>
        {getSupportedChains().map((chain: Chain & { testnet?: boolean }) => (
          <MenuItem key={chain.id} onClick={() => handleSwitchNetwork(chain)}>
            <ChainLogo chainId={chain.id} mr={2} />
            {chain.name}
            {chain.testnet && (
              <Tag ml={1} size={"sm"}>
                Testnet
              </Tag>
            )}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

export type HeaderProps = {
  title?: string;
  allowNetworkChange?: boolean;
};

export default function Header({ title = "Yamawake", allowNetworkChange = true }: HeaderProps) {
  const router = useRouter();
  const { requestedChain, connectedChain: chain } = useRequestedChain();
  const toast = useToast({ position: "top-right", isClosable: true });
  const { currentUser, mutate } = useContext(CurrentUserContext);
  const { address, isConnected, connector } = useAccount();
  const { data: ensName } = useEnsName({
    address: currentUser ? currentUser.address : address,
    staleTime: 1000 * 60 * 60 * 1,
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName,
    staleTime: 1000 * 60 * 60 * 1,
  });
  const [addressString, setAddressString] = useState<string>("");
  const { disconnect } = useDisconnect();
  const { t, locale } = useLocale();

  useEffect(() => {
    const _address = currentUser ? currentUser.address : address;
    setAddressString(`${_address?.slice(0, 5)}...${_address?.slice(-4)}`);
  }, [currentUser, address]);

  const handleSwitchNetwork = async (args: SwitchNetworkArgs) => {
    try {
      await switchNetwork(args);
    } catch (e: any) {
      toast({
        description: e.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const connectedMenu = () => {
    return (
      <>
        <Menu>
          <HStack spacing={1}>
            {chain?.id !== requestedChain.id ? (
              <Button
                size={"md"}
                colorScheme="red"
                onClick={() => handleSwitchNetwork({ chainId: requestedChain.id })}
              >
                {t("SWITCH_NETWORK_TO", { chainName: requestedChain.name })}
              </Button>
            ) : (
              <NetworkMenu
                allowNetworkChange={allowNetworkChange}
                chain={requestedChain}
                handleSwitchNetwork={(chain: Chain) => handleSwitchNetwork({ chainId: chain.id })}
              />
            )}

            {connector?.id && (
              <ProviderLogo
                display={{ base: "none", md: "flex" }}
                width={"26px"}
                fontSize={"26px"}
                ml={2}
                connectorId={connector.id}
              />
            )}
            <Menu>
              <MenuButton>
                <HStack>
                  {ensName && ensAvatar && <Avatar size={"sm"} src={ensAvatar} ml={1} />}
                  <VStack
                    display={{ base: "flex", md: "flex" }}
                    alignItems="flex-start"
                    spacing="1px"
                    ml="2"
                  >
                    <Text fontSize="sm" id="account">
                      {locale === "en" && (
                        <chakra.span display={{ base: "none", md: "inline" }}>
                          {currentUser ? "Signed in as " : ""}
                        </chakra.span>
                      )}
                      {ensName ? `${ensName}` : `${addressString}`}
                      {locale === "ja" && (
                        <chakra.span display={{ base: "none", md: "inline" }}>
                          {currentUser ? "でログイン中" : ""}
                        </chakra.span>
                      )}
                    </Text>
                  </VStack>
                  <ChevronDownIcon />
                </HStack>
              </MenuButton>
              <MenuList zIndex={101}>
                <HStack spacing={1} px={2} mb={2} display={{ base: "block", md: "none" }}>
                  <Menu>
                    <MenuButton as={chakra.span} cursor={"pointer"} disabled={!allowNetworkChange}>
                      <Tag
                        size={"md"}
                        display={{ base: "inline-flex", md: "none" }}
                        variant="solid"
                        colorScheme="teal"
                      >
                        {chain?.unsupported ? "Unsupported Chain" : chain?.name}
                        {chain?.testnet && <> (Testnet)</>}
                        <ChevronDownIcon />
                      </Tag>
                    </MenuButton>
                    {allowNetworkChange && (
                      <MenuList zIndex={101}>
                        {getSupportedChains().map((chain: Chain & { testnet?: boolean }) => (
                          <MenuItem
                            key={chain.id}
                            onClick={() => handleSwitchNetwork({ chainId: chain.id })}
                          >
                            <ChainLogo chainId={chain.id} mr={2} />
                            {chain.name}
                            {chain.testnet && (
                              <Tag ml={1} size={"sm"}>
                                Testnet
                              </Tag>
                            )}
                          </MenuItem>
                        ))}
                      </MenuList>
                    )}
                  </Menu>
                  {currentUser && (
                    <Tag size={"sm"} ml={1}>
                      Signed in
                    </Tag>
                  )}
                </HStack>
                <MenuItem
                  display={{ base: "block", md: "none" }}
                  onClick={() => router.push("/dashboard")}
                >
                  {t("DASHBOARD")}
                </MenuItem>
                <MenuItem
                  display={{ base: "block", md: "none" }}
                  onClick={() => router.push(`/auctions/${chain?.id}`)}
                >
                  {t("VIEW_ALL_SALES")}
                </MenuItem>
                <Divider display={{ base: "block", md: "none" }} />
                {currentUser ? (
                  <MenuItem
                    onClick={async () => {
                      await fetch("/api/logout", {
                        method: "POST",
                        credentials: "same-origin",
                      });
                      toast({
                        id: "signout",
                        title: "Signed out.",
                        status: "info",
                        duration: 5000,
                      });
                      disconnect();
                      mutate && mutate();
                    }}
                  >
                    {t("SIGN_OUT_AND_DISCONNECT")}
                  </MenuItem>
                ) : (
                  <>
                    <MenuItem onClick={() => disconnect()}>{t("DISCONNECT")}</MenuItem>
                    <Flex align="center" px="2" mt="2">
                      <Divider />
                      <Text padding="2" color={"gray.400"} fontSize={"xs"} whiteSpace={"nowrap"}>
                        {t("MANAGE_AUCTION")}
                      </Text>
                      <Divider />
                    </Flex>
                    <chakra.div px={3} py={1}>
                      <SignInButton
                        id="sign-in-with-ethereum-connection"
                        size={{ base: "xs", md: "sm" }}
                        w="full"
                        onSignInSuccess={async () => {
                          mutate && (await mutate());
                          router.push("/dashboard");
                        }}
                        onSignInError={(error: Error) => {
                          toast({
                            description: error.message,
                            status: "error",
                            duration: 5000,
                          });
                        }}
                      />
                    </chakra.div>
                  </>
                )}
              </MenuList>
            </Menu>
          </HStack>
        </Menu>
      </>
    );
  };

  return (
    <Box
      px={{ base: 0, md: 4 }}
      position={"sticky"}
      top={"0"}
      zIndex={100}
      bg={"chakra-body-bg"}
      opacity={0.975}
    >
      <Container maxW="container.2xl" px={{ base: 2, md: 4 }}>
        <Flex as="header" py="4" justifyContent="space-between" alignItems="center">
          <HStack>
            <Link
              href={`/?chainId=${requestedChain.id}`}
              textDecoration={"none"}
              _hover={{ textDecoration: "none" }}
            >
              <Heading as="h1" fontSize="xl">
                <Text
                  bgGradient="linear(to-l, #7928CA, #FF0080)"
                  bgClip="text"
                  fontSize="xl"
                  fontWeight="extrabold"
                >
                  {title ? title : "Yamawake"}
                </Text>
              </Heading>
            </Link>
          </HStack>
          <HStack spacing={{ base: 2, md: 4 }}>
            {isConnected && (
              <Button
                display={{ base: "none", md: "block" }}
                variant="ghost"
                size={{ base: "xs", md: "sm" }}
                onClick={() => router.push("/dashboard")}
              >
                {t("DASHBOARD")}
              </Button>
            )}
            <Button
              variant="ghost"
              display={{ base: "none", md: "block" }}
              size={{ base: "xs", md: "sm" }}
              onClick={() => router.push(`/auctions/${requestedChain.id}`)}
            >
              {t("VIEW_ALL_SALES")}
            </Button>
            <Button
              variant="ghost"
              display={{ base: isConnected ? "none" : "block", md: "none" }}
              size={{ base: "xs", md: "sm" }}
              onClick={() => router.push(`/auctions/${requestedChain.id}`)}
            >
              {t("SALES")}
            </Button>

            {!isConnected && (
              <NetworkMenu
                allowNetworkChange={allowNetworkChange}
                chain={requestedChain}
                handleSwitchNetwork={(chain: Chain) =>
                  router.push(getLinkPath(router.asPath, chain.id))
                }
              />
            )}

            {!currentUser && !isConnected && (
              <Menu>
                <HStack spacing={1}>
                  <MenuButton as={Button} size={{ base: "sm", md: "md" }}>
                    <HStack>
                      <Text fontSize={{ base: "xs", md: "sm" }} id="account">
                        {t("CONNECT_WALLET")}
                      </Text>
                      <ChevronDownIcon />
                    </HStack>
                  </MenuButton>
                  <MenuList zIndex={101}>
                    <Flex align="center" px="2">
                      <Divider />
                      <Text p="2" color={"gray.400"} fontSize={"xs"} whiteSpace={"nowrap"}>
                        {t("JOIN_AUCTION")}
                      </Text>
                      <Divider />
                    </Flex>
                    <chakra.div px={3} py={1}>
                      <ConnectButton
                        id="connectButton"
                        variant={"outline"}
                        size={{ base: "xs", md: "sm" }}
                        w={"full"}
                      />
                    </chakra.div>
                    <Flex align="center" px="2" mt="2">
                      <Divider />
                      <Text padding="2" color={"gray.400"} fontSize={"xs"} whiteSpace={"nowrap"}>
                        {t("MANAGE_AUCTION")}
                      </Text>
                      <Divider />
                    </Flex>
                    <chakra.div px={3} py={1}>
                      <SignInButton
                        id="sign-in-with-ethereum-header-no-connection"
                        size={{ base: "xs", md: "sm" }}
                        w="full"
                        onSignInSuccess={async () => {
                          mutate && (await mutate());
                          router.push("/dashboard");
                        }}
                        onSignInError={(error: Error) => {
                          toast({
                            description: error.message,
                            status: "error",
                            duration: 5000,
                          });
                        }}
                      />
                    </chakra.div>
                  </MenuList>
                </HStack>
              </Menu>
            )}
            {isConnected && connectedMenu()}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

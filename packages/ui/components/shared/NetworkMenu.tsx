import { Tag, Menu, MenuButton, MenuList, MenuItem, chakra } from "@chakra-ui/react";
import { Chain } from "@wagmi/core";
import { isSupportedChain } from "lib/utils/chain";
import { CHAIN_INFO } from "lib/constants/chains";
import { ChainLogo } from "../shared/ChainLogo";

type NetworkMenuProps = {
  allowNetworkChange: boolean;
  chain: Chain;
  handleSwitchNetwork: (chain: Chain) => void;
};

export default function NetworkMenu({
  allowNetworkChange,
  chain,
  handleSwitchNetwork,
}: NetworkMenuProps) {
  return (
    <Menu>
      <MenuButton
        disabled={!allowNetworkChange}
        cursor={allowNetworkChange ? "pointer" : "not-allowed"}
      >
        <Tag
          size={{ base: "lg", md: "lg" }}
          variant="solid"
          colorScheme={allowNetworkChange ? "green" : "gray"}
        >
          {!isSupportedChain(chain.id) ? (
            <chakra.span display={{ base: "none", md: "inline" }}>Unsupported Chain</chakra.span>
          ) : (
            <>
              <ChainLogo
                chainId={chain.id}
                mr={1}
                h={{ base: "14px", md: undefined }}
                w={{ base: "14px", md: undefined }}
              />
              <chakra.span display={{ base: "none", md: "inline" }}>{chain.name}</chakra.span>
            </>
          )}
          {chain.testnet && (
            <Tag ml={2} size={"sm"} display={{ base: "none", md: "inline-flex" }}>
              Testnet
            </Tag>
          )}
        </Tag>
      </MenuButton>
      <MenuList zIndex={101}>
        {Object.values(CHAIN_INFO).map((chain: Chain & { testnet?: boolean }) => (
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

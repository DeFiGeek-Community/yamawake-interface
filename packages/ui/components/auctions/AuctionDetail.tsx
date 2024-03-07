import { TEMPLATE_V1_NAME } from "lib/constants/templates";
import { AuctionProps, MetaData } from "lib/types/Auction";
import Render500 from "../errors/500";
import { KeyedMutator } from "swr";
import TemplateV1Detail from "./TemplateV1";
import {
  Box,
  Container,
  Flex,
  HStack,
  Heading,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import { memo } from "react";

export type DetailPageParams = {
  auctionProps: AuctionProps;
  refetchAuction: KeyedMutator<any>;
  metaData: MetaData;
  refetchMetaData: KeyedMutator<any>;
  address: `0x${string}` | undefined;
  contractAddress: `0x${string}`;
};

export default memo(function AuctionDetail(props: DetailPageParams) {
  // Add detail page components as needed
  switch (props.auctionProps.templateAuctionMap.templateName) {
    case TEMPLATE_V1_NAME:
      return <TemplateV1Detail {...props} />;
    default:
      return <Render500 error={new Error("Invalid template")} />;
  }
});

export function SkeletonAuction() {
  return (
    <Container maxW={"container.lg"} py={16}>
      <Flex alignItems={"center"} minH={"150px"}>
        <SkeletonCircle w={"150px"} h={"150px"} />
        <Box px={8}>
          <Heading>
            <Skeleton h={"30px"} />
          </Heading>
          <HStack mt={4} spacing={4}>
            <Skeleton h={"20px"} w={"100px"} />
            <Skeleton h={"20px"} w={"100px"} />
            <Skeleton h={"20px"} w={"100px"} />
          </HStack>
        </Box>
      </Flex>
      <Box mt={4}>
        <SkeletonText />
      </Box>
    </Container>
  );
}

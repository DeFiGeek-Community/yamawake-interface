import {
  chakra,
  Box,
  Divider,
  Skeleton,
  Card,
  CardBody,
  Stack,
  Flex,
  SkeletonText,
} from "@chakra-ui/react";
import { AuctionProps } from "lib/types/Auction";
import { TEMPLATE_V1_NAME } from "lib/constants/templates";
import V1 from "./TemplateV1/AuctionCardContent";

export default function AuctionCard({
  auctionProps,
  editable = false,
}: {
  auctionProps: AuctionProps;
  editable?: boolean;
}) {
  // Add auction card components as needed
  switch (auctionProps.templateAuctionMap.templateName) {
    case TEMPLATE_V1_NAME:
      return <V1 auctionProps={auctionProps} editable={editable} />;
    default:
      // Return null for unknown templateName
      return null;
  }
}

export const AuctionCardSkeleton = () => {
  return (
    <Card
      w={{ base: "100%" }}
      direction={{ base: "column", md: "row" }}
      overflow="hidden"
      alignItems={"stretch"}
    >
      <Box>
        <Skeleton
          w={{ base: "100%", md: "260px" }}
          h={{ base: "100%", md: "260px" }}
          maxW={{ base: "100%", md: "260px" }}
          boxShadow={"dark-lg"}
        />
      </Box>

      <Stack w={"full"}>
        <CardBody>
          <Flex>
            <chakra.div flex={11} pr={4}>
              <Skeleton h={"20px"} />
              <SkeletonText py="4" />
            </chakra.div>
            <Stack flex={8} spacing={4}>
              <Skeleton h={"20px"} borderRadius={"4px"} />
              <Divider />
              <Skeleton h={"20px"} borderRadius={"4px"} />
              <Skeleton h={"20px"} borderRadius={"4px"} />
              <Skeleton h={"20px"} borderRadius={"4px"} />
            </Stack>
          </Flex>
        </CardBody>
      </Stack>
    </Card>
  );
};

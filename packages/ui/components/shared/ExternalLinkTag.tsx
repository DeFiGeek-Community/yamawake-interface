import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Link, Tag, Image, HStack } from "@chakra-ui/react";
import { getDomainFromURL } from "lib/utils";

export const ExternalLinkTag = ({ url }: { url: string }) => {
  const urlObj = new URL(url);
  return (
    <Tag>
      <Link fontSize={"sm"} href={url} target={"_blank"}>
        <HStack>
          <Image
            maxW={"16px"}
            src={`https://s2.googleusercontent.com/s2/favicons?domain=${urlObj.host}`}
          />
          <div>
            {getDomainFromURL(url)} <ExternalLinkIcon />
          </div>
        </HStack>
      </Link>
    </Tag>
  );
};

export default ExternalLinkTag;

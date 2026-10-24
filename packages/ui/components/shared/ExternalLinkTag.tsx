import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Link, Tag, Image, HStack } from "@chakra-ui/react";
import { getDomainFromURL } from "lib/utils";

export const ExternalLinkTag = ({ url }: { url: string }) => {
  let urlObj: URL;
  try {
    urlObj = new URL(url);
  } catch {
    return null;
  }
  // Only render http(s) links to avoid javascript:/data: hrefs.
  if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
    return null;
  }
  return (
    <Tag>
      <Link fontSize={"sm"} href={url} target={"_blank"} rel={"noopener noreferrer"}>
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

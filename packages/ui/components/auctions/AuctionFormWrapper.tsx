import { useEffect, useState } from "react";
import { FormLabel, Select, Spinner, Tooltip, Link } from "@chakra-ui/react";
import { QuestionIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { ethers } from "ethers";
import { Template } from "lib/types/Auction";
import { COMPATIBLE_TEMPLATES, TEMPLATE_V1_NAME } from "lib/constants/templates";
import { useLocale } from "../../hooks/useLocale";
import TemplateV1AuctionForm from "./TemplateV1/AuctionForm";
import useTemplates from "../../hooks/useTemplates";

export type AuctionFormWrapperParams = {
  address: `0x${string}`;
  onSubmitSuccess?: (result: any) => void;
  onSubmitError?: (e: Error) => void;
  onApprovalTxSent?: (result: any) => void;
  onApprovalTxConfirmed?: (result: any) => void;
};

export default function AuctionFormWrapper(props: AuctionFormWrapperParams) {
  const { data: templateData } = useTemplates();
  const [templateName, setTemplateName] = useState<string | undefined>(TEMPLATE_V1_NAME);
  const { t } = useLocale();
  useEffect(() => {
    templateData &&
      templateData.templates.length > 0 &&
      setTemplateName(templateData.templates[0].templateName);
  }, [templateData]);
  return (
    <>
      <FormLabel htmlFor="token" alignItems={"baseline"}>
        {t("SELECT_SALE_TEMPLATE")}
        <Tooltip hasArrow label={t("YOU_CAN_CHOOSE_THE_TYPE_OF_TOKEN_SALE")}>
          <QuestionIcon mb={1} ml={1} />
        </Tooltip>
        <Link
          href="https://docs.yamawake.xyz"
          target="_blank"
          float={"right"}
          ml={4}
          mt={1}
          fontSize={"xs"}
          color={"gray.300"}
        >
          {t("TEMPLATE_EXPLANATION")} <ExternalLinkIcon />
        </Link>
      </FormLabel>
      <Select
        isDisabled={true}
        id="templateName"
        name="templateName"
        defaultValue={
          templateData &&
          templateData.templates.length > 0 &&
          templateData.templates[0].templateName
        }
        onChange={(ev) => setTemplateName(ev.target.value)}
        value={templateName}
      >
        {!templateData && (
          <option value="">
            <Spinner />
          </option>
        )}
        {templateData &&
          templateData.templates
            .filter((template: Template) => COMPATIBLE_TEMPLATES.includes(template.templateName))
            .map((template: Template) => (
              <option key={template.id} value={template.templateName}>
                {ethers.decodeBytes32String(template.templateName)}
              </option>
            ))}
      </Select>

      {
        // Add conditions below as needed
      }
      {templateName === TEMPLATE_V1_NAME && <TemplateV1AuctionForm {...props} />}
    </>
  );
}

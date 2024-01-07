import { useFormik } from "formik";
import {
  Button,
  HStack,
  Spinner,
  Flex,
  chakra,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormLabel,
  Tooltip,
  FormErrorMessage,
  FormControl,
  Input,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
  NumberInputStepper,
  NumberDecrementStepper,
  useColorMode,
  Grid,
  GridItem,
  useToast,
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";
import { useContractRead, erc20ABI, useNetwork } from "wagmi";
import { DatePicker, CustomProvider } from "rsuite";
import { jaJP, enUS } from "rsuite/locales";
import { format, addYears, addWeeks, addMonths, addDays } from "date-fns";
import { tokenAmountFormat, getStartOfDayInUTC, getRoundedWeekTimestamp } from "lib/utils";
import Big, { multiply } from "lib/utils/bignumber";
import { LockType } from "lib/types/VotingEscrow";
import TxSentToast from "../../shared/TxSentToast";
import { useLocale } from "../../../hooks/useLocale";
import useLock from "../../../hooks/VotingEscrow/useLock";
import useApprove from "../../../hooks/useApprove";
import "rsuite/dist/rsuite-no-reset.min.css";
import "assets/css/rsuite-override.css";
import FormModal from "./FormModal";

export default function NewLockForm({ address }: { address?: `0x${string}` }) {
  const { t } = useLocale();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button variant={"solid"} colorScheme="green" size={"sm"} onClick={onOpen}>
        {t("CREATE_NEW_LOCK")}
      </Button>
      {isOpen && (
        <FormModal
          address={address}
          type={LockType.CREATE_LOCK}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </>
  );
}

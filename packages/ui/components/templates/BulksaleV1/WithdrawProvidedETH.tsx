import { QuestionIcon } from "@chakra-ui/icons";
import { useToast, Box, Heading, chakra, Button, Tooltip, Flex } from "@chakra-ui/react";
import { useBalance } from "wagmi";
import useWithdrawProvidedETH from '../../../hooks/useWithdrawProvidedETH';
import { Sale } from "../../../types/BulksaleV1";
import { tokenAmountFormat } from "../../../utils";
import { getBigNumber } from "../../../utils/bignumber";
import TxSentToast from "../../TxSentToast";

type Props = {
    sale: Sale;
    onSuccessConfirm?: (data: any) => void;
}
export default function WithdrawProvidedETH({sale, onSuccessConfirm}: Props) {
    const toast = useToast({position: 'top-right', isClosable: true,})
    const { data: balanceData, isLoading: isLoadingBalance } = useBalance({address: sale.id as `0x${string}`});
    const {prepareFn: withdrawETHPrepareFn, writeFn: withdrawETHWriteFn, waitFn: withdrawETHWaitFn} = useWithdrawProvidedETH({ 
        targetAddress: sale.id as `0x${string}`, 
        onSuccessWrite: (data) => {
            toast({
                title: 'Transaction sent!',
                status: 'success',
                duration: 5000,
                render: (props) => <TxSentToast txid={data?.hash} {...props} />
            })
        },
        onErrorWrite: (e: Error) => {
            toast({
                description: e.message,
                status: 'error',
                duration: 5000,
            })
        },
        onSuccessConfirm: (data) => {
            toast({
                description: `Transaction confirmed!`,
                status: 'success',
                duration: 5000,
            })
            onSuccessConfirm && onSuccessConfirm(data);
        } 
    });

    return <Box>
        <Heading fontSize={'lg'} textAlign={'left'}>ETH balance of Sale contract</Heading>
        <Flex alignItems={'center'} justifyContent={'space-between'}>
            <chakra.p fontSize={'lg'}>{typeof balanceData !== 'undefined' ? tokenAmountFormat(getBigNumber(balanceData.value.toString()), 18, 2) : '-'} ETH</chakra.p>
            <Button
                variant={'solid'}
                isDisabled={!balanceData || balanceData.value.toNumber() === 0 || !withdrawETHWriteFn.writeAsync}
                isLoading={withdrawETHWriteFn.isLoading || withdrawETHWaitFn.isLoading}
                onClick={() => withdrawETHWriteFn.writeAsync()}
            >
                Withdraw ETH
                <Tooltip hasArrow label={'Finished, and enough Ether provided.'}><QuestionIcon mb={1} ml={1} /></Tooltip>
            </Button>
        </Flex>
    </Box>
}
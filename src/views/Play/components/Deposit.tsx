import styled from 'styled-components'
import { InputGroup } from './Input'
import { Flex, Text, Input, Button } from '@pancakeswap/uikit'
import { useStakePrizePoolContract, useTokenContract } from 'hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { useMemo, useState } from 'react'
import { useTokenBalance } from 'state/wallet/hooks'
import tokens from 'config/constants/tokens'
import BigNumber from 'bignumber.js'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { requiresApproval } from 'utils/requiresApproval'
import { MaxUint256 } from '@ethersproject/constants'
import useToast from 'hooks/useToast'
import { ToastDescriptionWithTx } from 'components/Toast'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'

const StyledColumn = styled.div<{ noMarginRight?: boolean }>`
  text-align: center;
  background: #222222;
  width: 100%;
  border: 1px solid rgb(22, 23, 46);
  border-radius: 16px;
  box-shadow: rgb(0 0 0 / 50%) 10px 10px 20px 0px;
  position: relative;
  padding: 16px 16px;
  ${({ noMarginRight, theme }) =>
    noMarginRight
      ? `
      margin-right: 24px;
      ${theme.mediaQueries.sm}{
        margin-right: 0px;
      }
      `
      : `
      margin-right: 24px;
      margin-bottom: 24px;
      ${theme.mediaQueries.sm}{
        margin-bottom: 24px;
      }
      ${theme.mediaQueries.md}{
        margin-bottom: 0px;
      }
      `}
`

const Deposit: React.FC<{ enabled: boolean; ticketSupply: string; depositedBalance: string }> = ({ enabled, ticketSupply, depositedBalance }) => {
  const { account } = useWeb3React()
  const prizePool = useStakePrizePoolContract()
  const tytanContract = useTokenContract(tokens.tytan.address)
  const { toastSuccess } = useToast()
  const { callWithGasPrice } = useCallWithGasPrice()

  const [amount, setAmount] = useState('0')
  const balance = useTokenBalance(account, tokens.tytan)

  const sanitizeInput = (num: string) => {
    let parsedNum = new BigNumber(num === '' ? '0' : num);
    if (parsedNum.lte(new BigNumber(balance?.toFixed(5) ?? '0'))) {
      let decimals = num.split(/[,.]+/)[1]?.length ?? 0;
      return parsedNum.toFixed(decimals <= 5 ? decimals ?? 0 : 5)
    }
    return amount
  }

  const odds = useMemo(() => {
    let n = new BigNumber(depositedBalance)
      .plus(new BigNumber(amount).multipliedBy(1e5))
      .div(new BigNumber(ticketSupply).plus(new BigNumber(amount).multipliedBy(1e5)))
      .multipliedBy(100)
    return n.isNaN() ? new BigNumber('0') : n
  }
    ,
    [depositedBalance, amount, ticketSupply])

  const { isApproving, isApproved, isConfirmed, isConfirming, handleApprove, handleConfirm } =
    useApproveConfirmTransaction({
      onRequiresApproval: async () => {
        return requiresApproval(tytanContract, account, prizePool.address)
      },
      onApprove: () => {
        return callWithGasPrice(tytanContract, 'approve', [prizePool.address, MaxUint256])
      },
      onApproveSuccess: async ({ receipt }) => {
        toastSuccess(
          'Contract approved.',
          <ToastDescriptionWithTx txHash={receipt.transactionHash} />,
        )
      },
      onConfirm: () => {
        return callWithGasPrice(prizePool, 'depositTo',
          [
            account,
            (new BigNumber(amount)).times(10 ** tokens.tytan.decimals).toFixed(0),
            getAddress(contracts.playTicket),
            "0x0000000000000000000000000000000000000000",
          ]
        )
      },
      onSuccess: async ({ receipt }) => {
        toastSuccess('Deposit complete.', <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
      },
    })

  return (
    <StyledColumn>
      <Text textAlign='left' mb="8px" fontSize={24}>Deposit</Text>
      <Flex>
        <InputGroup valueAction={() => { setAmount(`${balance?.toFixed(5) ?? '0'}`) }} valueActionLabel="MAX">
          <Input
            value={amount}
            type="number"
            onChange={(event) => setAmount(sanitizeInput(event.target.value))}
            style={{ height: '100%' }} />
        </InputGroup>
        <Button
          marginLeft={12}
          disabled={Number(amount) <= 0 || !enabled}
          onClick={
            isApproved ? handleConfirm : handleApprove
          }
        >
          {isApproved ? 'Deposit' : 'Approve'}</Button>
      </Flex>
      <Text textAlign="left" mt='8px'>Balance: {balance?.toFixed(2) ?? '0'}</Text>
      {Number(amount) > 0 &&
        <>
          <Text textAlign="left" mt='8px'>This increases your odds to {odds.toFixed(2, BigNumber.ROUND_DOWN)}%, or 1 in {new BigNumber(100).dividedBy(odds).toFixed(2)}.</Text>
        </>
      }
    </StyledColumn>
  )
}

export default Deposit
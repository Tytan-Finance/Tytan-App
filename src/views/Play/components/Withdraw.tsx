import styled from 'styled-components'
import { InputGroup } from './Input'
import { Flex, Text, Input, Button } from '@pancakeswap/uikit'
import { useStakePrizePoolContract, useTokenContract } from 'hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useState } from 'react'
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
import { formatEther, parseUnits } from '@ethersproject/units'
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

const Deposit: React.FC = () => {
  const { account } = useWeb3React()
  const prizePool = useStakePrizePoolContract()
  const tytanContract = useTokenContract(tokens.tytan.address)
  const { toastSuccess, toastError } = useToast()
  const { callWithGasPrice } = useCallWithGasPrice()

  const [amount, setAmount] = useState('0')
  const balance = useTokenBalance(account, tokens.tytan)

  const sanitizeInput = (num: string) => {
    let parsedNum = new BigNumber(num === '' ? '0' : num);
    if (parsedNum.lte(new BigNumber(balance?.toExact() ?? '0'))) {
      return parsedNum.decimalPlaces(5).toString()
    }
    return amount
  }

  const handleConfirm = useCallback(() => {
    callWithGasPrice(prizePool, 'withdrawInstantlyFrom',
      [
        account,
        parseUnits(amount, tokens.tytan.decimals),
        getAddress(contracts.playTicket),
        parseUnits('0.3', 18)
      ])
      .then((txn) => {
        toastSuccess('Deposit submitted.', <ToastDescriptionWithTx txHash={txn.hash} />)
        txn.wait().then(() => {
          toastSuccess('Deposit complete.', <ToastDescriptionWithTx txHash={txn.hash} />)
        })

      }).catch(() => {
        toastError('Error on deposit. Try again.')
      })
  }, [prizePool])

  return (
    <StyledColumn>
      <Text textAlign='left' mb="8px" fontSize={24}>Withdraw</Text>
      <Flex>
        <InputGroup valueAction={() => { setAmount(`${balance.toFixed(5)}`) }} valueActionLabel="MAX">
          <Input
            value={amount}
            type="number"
            onChange={(event) => setAmount(sanitizeInput(event.target.value))}
            style={{ height: '100%' }} />
        </InputGroup>
        <Button
          marginLeft={12}
          disabled={Number(amount) <= 0}
          onClick={handleConfirm}
        >
          Withdraw</Button>
      </Flex>
      <Text textAlign="left" mt='8px'>Balance: {balance?.toFixed(2)}</Text>
    </StyledColumn>
  )
}

export default Deposit

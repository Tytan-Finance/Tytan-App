import styled from 'styled-components'
import { InputGroup } from './Input'
import { Flex, Text, Input, Button, Link } from '@pancakeswap/uikit'
import { useStakePrizePoolContract, useTokenContract } from 'hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useMemo, useState } from 'react'
import tokens from 'config/constants/tokens'
import BigNumber from 'bignumber.js'
import useToast from 'hooks/useToast'
import { ToastDescriptionWithTx } from 'components/Toast'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { parseUnits } from '@ethersproject/units'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { SLOW_INTERVAL } from 'config/constants'
import useSWR from 'swr'
import { multicallv2 } from 'utils/multicall'
import { BigNumber as EthersBigNumber } from "@ethersproject/bignumber"
import erc20 from "config/abi/erc20.json"

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
  const { toastSuccess, toastError } = useToast()
  const { callWithGasPrice } = useCallWithGasPrice()

  const [amount, setAmount] = useState('0')

  const {
    data: { balance } = {
      balance: new BigNumber(0)
    },
    mutate
  } = useSWR(
    ['depositBalance'],
    async () => {
      const balanceCall = {
        address: getAddress(contracts.playTicket),
        name: 'balanceOf',
        params: [account]
      }

      let tokenDataResultRaw: EthersBigNumber[] = await Promise.all([
        multicallv2(erc20, [balanceCall], {
          requireSuccess: false,
        }),
      ])

      const [balance] = tokenDataResultRaw.flat()

      return {
        balance: balance ? new BigNumber(balance.toString()) : new BigNumber(0),
      }
    },
    {
      refreshInterval: SLOW_INTERVAL,
    },
  )

  const odds = useMemo(() => {
    let n = new BigNumber(depositedBalance)
      .minus(new BigNumber(amount).multipliedBy(1e5))
      .div(new BigNumber(ticketSupply).minus(new BigNumber(amount).multipliedBy(1e5)))
      .multipliedBy(100)
    return n.isNaN() ? new BigNumber('0') : n
  }
    ,
    [depositedBalance, amount, ticketSupply])

  const sanitizeInput = (num: string) => {
    let parsedNum = new BigNumber(num === '' ? '0' : num);
    if (parsedNum.lte(new BigNumber(balance.toString() ?? '0').div(1e5))) {
      let decimals = num.split(/[,.]+/)[1]?.length ?? 0;
      return parsedNum.toFixed(decimals <= 5 ? decimals ?? 0 : 5)
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
        toastSuccess('Withdraw submitted.', <ToastDescriptionWithTx txHash={txn.hash} />)
        txn.wait().then(() => {
          toastSuccess('Withdraw complete.', <ToastDescriptionWithTx txHash={txn.hash} />)
        })

      }).catch(() => {
        toastError('Error on withdraw. Try again.')
      })
  }, [prizePool])

  return (
    <StyledColumn>
      <Text textAlign='left' mb="8px" fontSize={24}>Withdraw</Text>
      <Flex>
        <InputGroup valueAction={() => { setAmount(`${balance.dividedBy(1e5).toFixed(5) ?? '0'}`) }} valueActionLabel="MAX">
          <Input
            value={amount}
            type="number"
            onChange={(event) => setAmount(sanitizeInput(event.target.value))}
            style={{ height: '100%' }} />
        </InputGroup>
        <Button
          marginLeft={12}
          disabled={Number(amount) <= 0 || !enabled}
          onClick={handleConfirm}
        >
          Withdraw</Button>
      </Flex>
      <Text textAlign="left" mt='8px'>Deposited Balance: {balance?.div(1e5)?.toFixed(2) ?? '0'}</Text>
      {Number(amount) > 0 &&
        <>
          <Text textAlign="left" mt='8px'>This decreases your odds to {odds.toFixed(2, BigNumber.ROUND_DOWN)}%, or 1 in {new BigNumber(100).dividedBy(odds).toFixed(2)}.</Text>
          <Text textAlign="left" mt='8px'>Early withdraw may incur a fee of up to 30%. <br /> See the <Link href='' style={{ display: 'inline' }}>docs</Link>.</Text>
        </>
      }
    </StyledColumn>
  )
}

export default Deposit

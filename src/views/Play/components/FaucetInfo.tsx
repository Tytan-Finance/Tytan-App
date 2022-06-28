import { Flex, Button, Text, Skeleton } from "@pancakeswap/uikit"
import { useTokenFaucetContract } from "hooks/useContract"
import { useCallback, useMemo } from "react"
import styled from "styled-components"
import BigNumber from "bignumber.js"
import { useWeb3React } from "@web3-react/core"
import { useCallWithGasPrice } from "hooks/useCallWithGasPrice"
import useToast from "hooks/useToast"
import { ToastDescriptionWithTx } from "components/Toast"

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

interface FaucetInfoProps {
  faucetDripRate: string;
  ticketSupply: string;
  exchangeRateMantissa: string;
  lastUserExchangeRate: string;
  userMeasureBalance: string;
  mutateData: () => any;
}

const FaucetInfo: React.FC<FaucetInfoProps> = (props) => {
  const { faucetDripRate, ticketSupply, exchangeRateMantissa, lastUserExchangeRate, userMeasureBalance, mutateData } = props;
  const { account } = useWeb3React()
  const { callWithGasPrice } = useCallWithGasPrice()
  const tokenFaucet = useTokenFaucetContract()
  const { toastSuccess, toastError } = useToast()

  const dailyRoi = useMemo(() => {
    let tokensPerTicketPerDay = (new BigNumber(faucetDripRate)).div(ticketSupply).times(60 * 60 * 24)
    return tokensPerTicketPerDay.times(100)
  }, [faucetDripRate, ticketSupply])

  const dataLoaded = useMemo(() => dailyRoi.gt(0), [dailyRoi])

  const apr = useMemo(() => {
    return dailyRoi.times(365)
  }, [dailyRoi])

  const apy = useMemo(() => {
    return dailyRoi.div(100).plus(1).pow(365).minus(1).times(100)
  }, [dailyRoi])

  const claimable = useMemo(() => {
    if (account) {
      let deltaRateMantissa = new BigNumber(exchangeRateMantissa).minus(new BigNumber(lastUserExchangeRate))
      let newTokens = new BigNumber(userMeasureBalance).times(new BigNumber(deltaRateMantissa).div(new BigNumber(1e18)).div(10 ** 5))
      return newTokens
    }
    return new BigNumber(0)
  }, [exchangeRateMantissa, lastUserExchangeRate, userMeasureBalance])


  const handleConfirm = useCallback(() => {
    callWithGasPrice(tokenFaucet, 'claim',
      [
        account
      ])
      .then((txn) => {
        toastSuccess('Claim submitted.', <ToastDescriptionWithTx txHash={txn.hash} />)
        txn.wait().then(() => {
          toastSuccess('Claimed tokens!', <ToastDescriptionWithTx txHash={txn.hash} />)
        })
        mutateData()
      }).catch(() => {
        toastError('Error on claim. Try again.')
      })
  }, [tokenFaucet])

  return (
    <Flex flexDirection={['column', null, null, 'row']} mb='48px'>
      <StyledColumn>
        <Flex justifyContent="space-between">
          <Text>Current APY:</Text>
          {dataLoaded ? <Text maxWidth={128} overflow="hidden">{apy.toFixed(2)}%</Text> : <Skeleton width="72px" />}
        </Flex>
        <Flex justifyContent="space-between">
          <Text>Current APR:</Text>
          {dataLoaded ? <Text>{apr.toFixed(2)}%</Text> : <Skeleton width="72px" />}
        </Flex>
        <Flex justifyContent="space-between">
          <Text>Daily ROI:</Text>
          {dataLoaded ? <Text>{dailyRoi.toFixed(2)}%</Text> : <Skeleton width="72px" />}
        </Flex>
        <Flex justifyContent="space-between">
          <Text>Claimable:</Text>
          {dataLoaded ? <Text>{claimable.toFixed(5)}</Text> : <Skeleton width="72px" />}

        </Flex>
        {account && claimable.gt(0) && (
          <>
            <Button
              onClick={handleConfirm}>Claim</Button>
          </>
        )}
      </StyledColumn>
    </Flex>
  )
}

export default FaucetInfo
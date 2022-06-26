import { Flex, Skeleton, SkeletonV2, Text } from "@pancakeswap/uikit"
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import Divider from "components/Divider"
import tokens from "config/constants/tokens";
import { useMemo } from "react";
import { useTokenBalance } from "state/wallet/hooks";
import styled from "styled-components"

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

interface PrizePoolInfoProps {
  playBalance: string;
  ticketTotalSupply: string;
  poolsNumberOfWinners: string;
}

const PrizePoolInfo: React.FC<PrizePoolInfoProps> = ({ playBalance, ticketTotalSupply, poolsNumberOfWinners }) => {
  const { account } = useWeb3React()
  const userTytanBalance = useTokenBalance(account, tokens.tytan)

  const odds = useMemo(() => (new BigNumber(playBalance)).div(ticketTotalSupply), [playBalance, ticketTotalSupply])
  const dataLoaded = useMemo(() => new BigNumber(ticketTotalSupply).gt(0), [ticketTotalSupply])

  return (
    <Flex flexDirection={['column', null, null, 'row']} mb='48px'>
      <StyledColumn>
        <Text fontSize={32}>Prize Pool Info</Text>
        <Flex justifyContent="space-between">
          <Text>Your Total PLAY Balance:</Text>
          {dataLoaded ? <Text>{(new BigNumber(playBalance)).div(1e5).toFixed(2)}</Text> : <Skeleton width="72px" />}

        </Flex>
        <Flex justifyContent="space-between">
          <Text>Your odds:</Text>
          {dataLoaded ? <Text>{odds?.toFixed(5)}%</Text> : <Skeleton width="72px" />}

        </Flex>
        <Flex justifyContent="space-between">
          <Text>Your Wallet TYTAN Balance</Text>
          {dataLoaded ? <Text>{userTytanBalance?.toFixed(2)}</Text> : <Skeleton width="72px" />}

        </Flex>

        <Divider />
        <Flex justifyContent="space-between">
          <Text>Number Of Winners:</Text>
          <Text>{poolsNumberOfWinners}</Text>

        </Flex>
        {/*  <Flex justifyContent="space-between">
          <Text>Total Deposits:</Text>
          <Text>TODO%</Text>
        </Flex> */}
        <Flex justifyContent="space-between">
          <Text>Early exit fee:</Text>
          <Text>30%</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text>Exit fee decay time</Text>
          <Text>16 days</Text>
        </Flex>
      </StyledColumn>
    </Flex>
  )
}

export default PrizePoolInfo
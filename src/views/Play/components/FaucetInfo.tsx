import { Flex, Button, Text } from "@pancakeswap/uikit"
import contracts from "config/constants/contracts"
import { useTokenContract } from "hooks/useContract"
import { useMemo, useState } from "react"
import styled from "styled-components"
import { getAddress } from "utils/addressHelpers"
import tokens from 'config/constants/tokens'
import useSWR from "swr"
import { formatBigNumber } from "utils/formatBalance"
import { multicallv2 } from "utils/multicall"
import erc20 from 'config/abi/erc20.json'
import tokenFaucet from 'config/abi/tokenFaucet.json'
import { SLOW_INTERVAL } from "config/constants"
import BigNumber from "bignumber.js"
import { BigNumber as EthersBigNumber } from "@ethersproject/bignumber"

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

const FaucetInfo = () => {
  const ticket = useTokenContract(getAddress(contracts.playTicket))
  const tytan = useTokenContract(tokens.tytan.address)

  const {
    data: { ticketSupply, faucetDripRate } = {
      ticketSupply: '0',
      faucetDripRate: '0',
    },
  } = useSWR(
    ['faucetInfo'],
    async () => {
      const supplyCall = {
        address: getAddress(contracts.playTicket),
        name: 'totalSupply'
      }
      const faucetDripRateCall = {
        address: getAddress(contracts.tokenFaucet),
        name: 'dripRatePerSecond',
      }
      const claimableCall = {
        address: getAddress(contracts.tokenFaucet),

      }
      const tokenDataResultRaw: EthersBigNumber[] = await Promise.all([
        multicallv2(erc20, [supplyCall], {
          requireSuccess: false,
        }),
        multicallv2(tokenFaucet, [faucetDripRateCall], {
          requireSuccess: false,
        }),
      ])

      const [totalSupply, faucetDripRate] = tokenDataResultRaw.flat()
      return {
        ticketSupply: totalSupply ? totalSupply.toString() : '0',
        faucetDripRate: faucetDripRate ? faucetDripRate.toString() : '0'
      }
    },
    {
      refreshInterval: SLOW_INTERVAL,
    },
  )

  const dailyRoi = useMemo(() => {
    let tokensPerTicketPerDay = (new BigNumber(faucetDripRate)).div(ticketSupply).times(60 * 60 * 24)
    return tokensPerTicketPerDay.times(100)
  }, [faucetDripRate, ticketSupply])

  const apr = useMemo(() => {
    return dailyRoi.times(365)
  }, [dailyRoi])

  const apy = useMemo(() => {
    return dailyRoi.div(100).plus(1).pow(365).minus(1).times(100)
  }, [dailyRoi])

  return (
    <Flex flexDirection={['column', null, null, 'row']} mb='48px'>
      <StyledColumn>
        <Flex justifyContent="space-between">
          <Text>Current APY:</Text>
          <Text>{apy.toFixed(2)}%</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text>Current APR:</Text>
          <Text>{apr.toFixed(2)}%</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text>Daily ROI:</Text>
          <Text>{dailyRoi.toFixed(2)}%</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text>Claimable:</Text>
          <Text>TODO</Text>
        </Flex>
        <Button>Claim</Button>
      </StyledColumn>
    </Flex>
  )
}

export default FaucetInfo
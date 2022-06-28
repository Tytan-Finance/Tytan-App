import erc20 from "config/abi/erc20.json"
import tokenFaucetAbi from "config/abi/tokenFaucet.json"
import contracts from "config/constants/contracts"
import useSWR from "swr"
import { multicallv2 } from "utils/multicall"
import FaucetInfo from "./FaucetInfo"
import PrizePoolInfo from "./PrizePoolInfo"
import { useWeb3React } from '@web3-react/core';
import { getAddress } from "utils/addressHelpers"
import { BigNumber as EthersBigNumber } from "@ethersproject/bignumber"
import { Flex } from "@pancakeswap/uikit"
import Deposit from "./Deposit"
import Withdraw from "./Withdraw"

const Info: React.FC<{ enableDeposits: boolean }> = ({ enableDeposits }) => {
  const { account } = useWeb3React()

  const {
    data: { ticketSupply, faucetDripRate, userMeasureBalance, lastUserExchangeRate, exchangeRateMantissa } = {
      ticketSupply: '0',
      faucetDripRate: '0',
      userMeasureBalance: '0',
      lastUserExchangeRate: '0',
      exchangeRateMantissa: '0'
    },
    mutate,
  } = useSWR(
    ['faucetInfoData'],
    async () => {
      const supplyCall = {
        address: getAddress(contracts.playTicket),
        name: 'totalSupply'
      }
      const userMeasureBalanceCall = {
        address: getAddress(contracts.playTicket),
        name: 'balanceOf',
        params: [account ?? "0x0000000000000000000000000000000000000000"]
      }

      const faucetDripRateCall = {
        address: getAddress(contracts.tokenFaucet),
        name: 'dripRatePerSecond',
      }
      const userStateCall = {
        address: getAddress(contracts.tokenFaucet),
        name: 'userStates',
        params: [account ?? "0x0000000000000000000000000000000000000000"]
      }
      const exchangeRateMantissaCall = {
        address: getAddress(contracts.tokenFaucet),
        name: 'exchangeRateMantissa'
      }

      let tokenDataResultRaw: EthersBigNumber[] = await Promise.all([
        multicallv2(erc20, [supplyCall, userMeasureBalanceCall], {
          requireSuccess: false,
        }),
        multicallv2(tokenFaucetAbi, [faucetDripRateCall, userStateCall, exchangeRateMantissaCall], {
          requireSuccess: false,
        }),
      ])

      const [totalSupply, userMeasureBalance, faucetDripRate, lastUserExchangeRate, , exchangeRateMantissa] = tokenDataResultRaw.flat(3)

      return {
        ticketSupply: totalSupply ? totalSupply.toString() : '0',
        faucetDripRate: faucetDripRate ? faucetDripRate.toString() : '0',
        userMeasureBalance: userMeasureBalance ? userMeasureBalance.toString() : '0',
        lastUserExchangeRate: lastUserExchangeRate ? lastUserExchangeRate.toString() : '0',
        exchangeRateMantissa: exchangeRateMantissa ? exchangeRateMantissa.toString() : '0',
      }
    },
    {
      refreshInterval: 10000,
    },
  )

  return (
    <>
      <Flex flexDirection={['column', null, null, 'row']} mb='48px'>
        <Deposit enabled={enableDeposits} ticketSupply={ticketSupply} depositedBalance={userMeasureBalance} />
        <Withdraw enabled={enableDeposits} ticketSupply={ticketSupply} depositedBalance={userMeasureBalance} />
      </Flex>

      <FaucetInfo
        {...{
          ticketSupply,
          faucetDripRate,
          userMeasureBalance,
          lastUserExchangeRate,
          exchangeRateMantissa,
          mutateData: mutate
        }} />

      <PrizePoolInfo
        playBalance={userMeasureBalance}
        ticketTotalSupply={ticketSupply}
        poolsNumberOfWinners={"25"}
      />
    </>

  )
}

export default Info
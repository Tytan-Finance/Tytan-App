import { Flex, Heading, Skeleton, Text } from '@pancakeswap/uikit'
import Balance from 'components/Balance'
import { useWeb3React } from '@web3-react/core'
import tytanAbi from 'config/abi/tytan.json'
import tokens from 'config/constants/tokens'
import { useTranslation } from 'contexts/Localization'
import useIntersectionObserver from 'hooks/useIntersectionObserver'
import { useEffect, useState } from 'react'
import { usePriceCakeBusd } from 'state/farms/hooks'
import styled from 'styled-components'
import { formatBigNumber, formatLocalisedCompactNumber } from 'utils/formatBalance'
import { multicallv2 } from 'utils/multicall'
import useSWR from 'swr'
import { SLOW_INTERVAL } from 'config/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { getCakeVaultV2Contract } from 'utils/contractHelpers'

const StyledColumn = styled.div<{noMarginRight?: boolean}>`
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

const StyledText = styled(Text)`
  margin-bottom: 12px;
  font-size: 14px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 24px;
  }
`

const StatusText = styled(Text)`
  position: absolute;
  right: 24px;
  top: 16px;
  font-size: 12px;
`

const StyledBalance = styled(Balance)`
  font-size: 24px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 40px;
  }
`

const StyledHeading = styled(Heading)`
  font-size: 24px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 40px;
  }
`

const emissionsPerBlock = 14.25

/**
 * User (Planet Finance) built a contract on top of our original manual CAKE pool,
 * but the contract was written in such a way that when we performed the migration from Masterchef v1 to v2, the tokens were stuck.
 * These stuck tokens are forever gone (see their medium post) and can be considered out of circulation."
 * https://planetfinanceio.medium.com/pancakeswap-works-with-planet-to-help-cake-holders-f0d253b435af
 * https://twitter.com/PancakeSwap/status/1523913527626702849
 * https://bscscan.com/tx/0xd5ffea4d9925d2f79249a4ce05efd4459ed179152ea5072a2df73cd4b9e88ba7
 */
const planetFinanceBurnedTokensWei = BigNumber.from('637407922445268000000000')
const cakeVault = getCakeVaultV2Contract()
const apy = 125124.33;
const padTo2Digits = (num) => {
  return num.toString().padStart(2, '0');
}

const formatDate = (date) => {
  return [
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
    date.getFullYear(),
  ].join('/');
}
const Earned = () => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const { observerRef, isIntersecting } = useIntersectionObserver()
  const [loadData, setLoadData] = useState(false)
  const {
    data: { cakeSupply, burnedBalance, myBalance } = {
      cakeSupply: 0,
      burnedBalance: 0,
      myBalance: 0,
    },
  } = useSWR(
    loadData ? ['earned'] : null,
    async () => {
      const burnedTokenCall = {
        address: tokens.tytan.address,
        name: 'balanceOf',
        params: [account],
      }
      const [tokenDataResultRaw, totalLockedAmount] = await Promise.all([
        multicallv2(tytanAbi, [burnedTokenCall], {
          requireSuccess: false,
        }),
        cakeVault.totalLockedAmount(),
      ])
      const [userBalance] = tokenDataResultRaw.flat()


      return {
        cakeSupply: userBalance ? +formatBigNumber(userBalance, 0 ,5) : 0,
        burnedBalance: userBalance ? +formatBigNumber(userBalance, 0 ,5) : 0,
        myBalance: userBalance ? +formatBigNumber(userBalance, 0 ,5) : 0
      }
    },
    {
      refreshInterval: SLOW_INTERVAL,
    },
  )
  const cakePriceBusd = usePriceCakeBusd()
  const mcap = cakePriceBusd.times(myBalance)
  const mcapString = formatLocalisedCompactNumber(mcap.toNumber())
  
  const today = new Date()

  useEffect(() => {
    if (isIntersecting) {
      setLoadData(true)
    }
  }, [isIntersecting])

  return (
    <Flex flexDirection={['column', null, null, 'row']} mb='48px'>
      <StyledColumn style={{ gridArea: 'a' }}>
        <StyledText color="textSubtle">{t('Your Balance')}</StyledText>
        {myBalance ? (
          <StyledBalance color="primary"  decimals={0} lineHeight="1.1" bold value={myBalance} />
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
        <StyledText color="textSubtle">{formatDate(today)}</StyledText>
      </StyledColumn>
      <StyledColumn noMarginRight style={{ gridArea: 'b' }}>
        <StyledText color="textSubtle">{t('APY')}</StyledText>
        {cakeSupply ? (
          <StyledBalance color="primary"  decimals={2} lineHeight="1.1" bold value={apy} unit='%'/>
        ) : (
          <>
            <div ref={observerRef} />
            <Skeleton height={24} width={126} my="4px" />
          </>
        )}
        <StyledText color="textSubtle">{t('Daily ROI 1.97%')}</StyledText>
      </StyledColumn>
    </Flex>
  )
}

export default Earned

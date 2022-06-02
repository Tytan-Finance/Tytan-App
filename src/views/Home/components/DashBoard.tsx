import { Flex, Heading, Skeleton, Text } from '@pancakeswap/uikit'
import Balance from 'components/Balance'
import cakeAbi from 'config/abi/cake.json'
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

const StyledColumn = styled(Flex)<{ noMobileBorder?: boolean; noDesktopBorder?: boolean }>`
  flex-direction: column;
  text-align: center;
  ${({ noMobileBorder, theme }) =>
    noMobileBorder
      ? `${theme.mediaQueries.md} {
           padding: 0 16px;
         }
       `
      : `padding: 0 8px;
         ${theme.mediaQueries.sm} {
           padding: 0 16px;
         }
       `}

  ${({ noDesktopBorder, theme }) =>
    noDesktopBorder &&
    `${theme.mediaQueries.md} {
           padding: 0;
           border-left: none;
         }
       `}
`

const Grid = styled.div`
  display: grid;
  grid-gap: 16px 8px;
  margin-top: 24px;
  margin-bottom: 36px;
  padding: 16px 24px;
  background: #222222;
  border: 1px solid rgb(22, 23, 46);
  border-radius: 16px;
  box-shadow: rgb(0 0 0 / 50%) 10px 10px 20px 0px;
  position: relative;
  justify-content: space-around;
  grid-template-columns: repeat(2, auto);
  grid-template-areas:
    'a c'
    'b d';

  ${({ theme }) => theme.mediaQueries.sm} {
    grid-gap: 16px;
    
  }

  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-areas:
      'a b c d';
    grid-gap: 32px;
    grid-template-columns: repeat(3, auto);
  }
`
const StyledText = styled(Text)`
  margin-bottom: 12px;
  font-size: 14px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 24px;
  }
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

const DashBoard = () => {
  const { t } = useTranslation()
  const { observerRef, isIntersecting } = useIntersectionObserver()
  const [loadData, setLoadData] = useState(false)
  const {
    data: { cakeSupply, burnedBalance, circulatingSupply } = {
      cakeSupply: 0,
      burnedBalance: 0,
      circulatingSupply: 0,
    },
  } = useSWR(
    loadData ? ['cakeDataRow'] : null,
    async () => {
      const totalSupplyCall = { address: tokens.cake.address, name: 'totalSupply' }
      const burnedTokenCall = {
        address: tokens.cake.address,
        name: 'balanceOf',
        params: ['0x000000000000000000000000000000000000dEaD'],
      }
      const [tokenDataResultRaw, totalLockedAmount] = await Promise.all([
        multicallv2(cakeAbi, [totalSupplyCall, burnedTokenCall], {
          requireSuccess: false,
        }),
        cakeVault.totalLockedAmount(),
      ])
      const [totalSupply, burned] = tokenDataResultRaw.flat()

      const totalBurned = planetFinanceBurnedTokensWei.add(burned)
      const circulating = totalSupply.sub(totalBurned.add(totalLockedAmount))

      return {
        cakeSupply: totalSupply && burned ? +formatBigNumber(totalSupply.sub(totalBurned)) : 0,
        burnedBalance: burned ? +formatBigNumber(totalBurned) : 0,
        circulatingSupply: circulating ? +formatBigNumber(circulating) : 0,
      }
    },
    {
      refreshInterval: SLOW_INTERVAL,
    },
  )
  const cakePriceBusd = usePriceCakeBusd()
  const mcap = cakePriceBusd.times(circulatingSupply)
  const mcapString = formatLocalisedCompactNumber(mcap.toNumber())

  useEffect(() => {
    if (isIntersecting) {
      setLoadData(true)
    }
  }, [isIntersecting])

  return (
    <Grid>
      <Flex flexDirection="column" style={{ gridArea: 'a' }}>
        <StyledText color="textSubtle">{t('Circulating Supply')}</StyledText>
        {circulatingSupply ? (
          <StyledBalance color="primary"  decimals={0} lineHeight="1.1" bold value={circulatingSupply} />
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </Flex>
      <StyledColumn noMobileBorder style={{ gridArea: 'b' }}>
        <StyledText color="textSubtle">{t('Total supply')}</StyledText>
        {cakeSupply ? (
          <StyledBalance color="primary"  decimals={0} lineHeight="1.1" bold value={cakeSupply} />
        ) : (
          <>
            <div ref={observerRef} />
            <Skeleton height={24} width={126} my="4px" />
          </>
        )}
      </StyledColumn>
      <StyledColumn noMobileBorder style={{ gridArea: 'c' }}>
        <StyledText color="textSubtle">{t('Holders')}</StyledText>
        <StyledBalance color="primary" decimals={0} lineHeight="1.1" bold value={75000} />
      </StyledColumn>
      <StyledColumn noMobileBorder style={{ gridArea: 'd' }}>
        <StyledText color="textSubtle">{t('Market cap')}</StyledText>
        {mcap?.gt(0) && mcapString ? (
          <StyledHeading color="primary" scale="xl">{t('$%marketCap%', { marketCap: mcapString })}</StyledHeading>
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </StyledColumn>
    </Grid>
  )
}

export default DashBoard

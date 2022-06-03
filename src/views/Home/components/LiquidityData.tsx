import { Flex, Heading, Skeleton, Text } from '@pancakeswap/uikit'
import Balance from 'components/Balance'
import tytanAbi from 'config/abi/tytan.json'
import tokens from 'config/constants/tokens'
import { useTranslation } from 'contexts/Localization'
import useIntersectionObserver from 'hooks/useIntersectionObserver'
import { useEffect, useState } from 'react'
import { usePriceCakeBusd, useLpTokenPrice } from 'state/farms/hooks'
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

const LiquidityData = () => {
  const { t } = useTranslation()
  const { observerRef, isIntersecting } = useIntersectionObserver()
  const [loadData, setLoadData] = useState(false)
  const lpSymbol = 'CAKE-BNB LP'
  const lpPrice = useLpTokenPrice(lpSymbol)

  console.log(lpPrice.toNumber(), '45454')
  const {
    data: { treasury, circulatingSupply, liquidity } = {
      treasury: 0,
      circulatingSupply: 0,
      liquidity: 0,
    },
  } = useSWR(
    loadData ? ['tytanLiquidityAndTreasury'] : null,
    async () => {
      const totalSupplyCall = { 
        address: tokens.tytan.address, 
        name: 'totalSupply' 
      }
      const lpSupplyCall = { 
        address: '0x71125dfF884402eFFF470476440946eF04b56180', 
        name: 'totalSupply' 
      }
      const treasuryTokenCall = {
        address: tokens.tytan.address,
        name: 'balanceOf',
        params: ['0xD898A08817F664A3404A3e21f4990937a33b755D'],
      }
      const [tokenDataResultRaw] = await Promise.all([
        multicallv2(tytanAbi, [totalSupplyCall, treasuryTokenCall, lpSupplyCall], {
          requireSuccess: false,
        }),
      ])
      const [totalSupply, treasuryBalance, lpAmount] = tokenDataResultRaw.flat()

      const circulating = totalSupply

      return {
        treasury: treasuryBalance ? +formatBigNumber(treasuryBalance, 0, 5) : 0,
        circulatingSupply: circulating ? +formatBigNumber(circulating) : 0,
        liquidity: lpAmount ? +formatBigNumber(lpAmount) : 0,
      }
    },
    {
      refreshInterval: SLOW_INTERVAL,
    },
  )
  const tytanPriceBusd = usePriceCakeBusd()
  const treasuryCap = tytanPriceBusd.times(treasury)
  const treasuryString = formatLocalisedCompactNumber(treasuryCap.toNumber())
  const totalLiquidity = lpPrice.times(liquidity)
  const totalLiquidityString = formatLocalisedCompactNumber(totalLiquidity.toNumber())

  useEffect(() => {
    if (isIntersecting) {
      setLoadData(true)
    }
  }, [isIntersecting])

  return (
    <Flex flexDirection={['column', null, null, 'row']} mb='48px'>
      <StyledColumn style={{ gridArea: 'a' }}>
        <StyledText color="textSubtle">{t('Liquidity')}</StyledText>
        {totalLiquidity?.gt(0) && totalLiquidityString ? (
          <StyledHeading color="primary" scale="xl">{t('$%liquidity%', { liquidity: totalLiquidityString })}</StyledHeading>
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
        {/* <StatusText color="success">+1.5%</StatusText> */}
      </StyledColumn>
      <StyledColumn noMarginRight style={{ gridArea: 'b' }}>
        <StyledText color="textSubtle">{t('Treasury')}</StyledText>
        {treasuryCap?.gt(0) && treasuryString ? (
          <StyledHeading color="primary" scale="xl">{t('$%treasuryCap%', { treasuryCap: treasuryString })}</StyledHeading>
        ) : (
          <>
            <div ref={observerRef} />
            <Skeleton height={24} width={126} my="4px" />
          </>
        )}
        {/* <StatusText color="failure">-0.5%</StatusText> */}
      </StyledColumn>
    </Flex>
  )
}

export default LiquidityData

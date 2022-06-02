import { Flex, Heading, Skeleton, Text } from '@pancakeswap/uikit'
import Image from 'next/image'
import Balance from 'components/Balance'
import cakeAbi from 'config/abi/cake.json'
import tokens from 'config/constants/tokens'
import { useTranslation } from 'contexts/Localization'
import useIntersectionObserver from 'hooks/useIntersectionObserver'
import { useEffect, useState } from 'react'
import { usePriceCakeBusd } from 'state/farms/hooks'
import styled, { keyframes } from 'styled-components'
import { formatBigNumber, formatLocalisedCompactNumber } from 'utils/formatBalance'
import { multicallv2 } from 'utils/multicall'
import useSWR from 'swr'
import { SLOW_INTERVAL } from 'config/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { getCakeVaultV2Contract } from 'utils/contractHelpers'
import bunnyImage from '../../../../public/images/home/fixed-apy/coin.png'

const flyingAnim = () => keyframes`
  from {
    transform: translate(0,  0px);
  }
  50% {
    transform: translate(-5px, -5px);
  }
  to {
    transform: translate(0, 0px);
  }
`

const StyledColumn = styled.div`
  text-align: left;
  // background: #222222;
  width: 100%;
  // border: 1px solid rgb(22, 23, 46);
  // border-radius: 16px;
  // box-shadow: rgb(0 0 0 / 50%) 10px 10px 20px 0px;
  position: relative;
  padding: 16px 16px;
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

const BunnyWrapper = styled.div`
  width: 100%;
  animation: ${flyingAnim} 3.5s ease-in-out infinite;
  will-change: transform;
  > span {
    overflow: visible !important; // make sure the next-image pre-build blur image not be cropped
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

const Banner = () => {
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

  const fixedAPY = '125 124.'

  useEffect(() => {
    if (isIntersecting) {
      setLoadData(true)
    }
  }, [isIntersecting])

  return (
    <Flex flexDirection={['column', null, null, 'row']} mt='24px'>
      <StyledColumn>
        <StyledText color="textSubtle">{t('Fixed APY')}</StyledText>
        <StyledHeading color="primary" >{fixedAPY}
          <Text as="span" fontSize="0.85em" color="primary" bold>33</Text>
          %
        </StyledHeading>
        <StyledText color="textSubtle">{t('Auto-Staking & Compounding System')}</StyledText>
      </StyledColumn>
      <BunnyWrapper>
          <Image src={bunnyImage} priority placeholder="blur" alt={t('Lunar bunny')} />
        </BunnyWrapper>
    </Flex>
  )
}

export default Banner

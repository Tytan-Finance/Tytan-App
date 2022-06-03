import { Flex, Heading, Skeleton, Text } from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
import Balance from 'components/Balance'
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

const StyledColumn = styled.div`
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
`

const Grid = styled.div`
  display: grid;
  flex: 1 1 0%;
`

const Container = styled.div`
  display: grid;
  flex: 1 1 0%;
  row-gap: 20px;
`

const Wrapper = styled.div`
  padding: 16px 24px;
  border: 1px solid rgb(22, 23, 46);
  border-radius: 16px;
  box-shadow: rgb(0 0 0 / 50%) 10px 10px 20px 0px;
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

const RebaseInfo = () => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const { observerRef, isIntersecting } = useIntersectionObserver()
  const [loadData, setLoadData] = useState(false)
  const {
    data: { tytanBalance, burnedBalance, circulatingSupply } = {
      tytanBalance: 0,
      burnedBalance: 0,
      circulatingSupply: 0,
    },
  } = useSWR(
    loadData ? ['rebaseData'] : null,
    async () => {
      const balanceCall = { 
        address: tokens.tytan.address,
        name: 'balanceOf',
        params: [account],
      }
      const burnedTokenCall = {
        address: tokens.tytan.address,
        name: 'balanceOf',
        params: ['0x15E4A5d2Ee7d3836176D9Fb72e12020C068Ca5EF'],
      }
      const totalSupplyCall = { 
        address: tokens.tytan.address,
        name: 'totalSupply',
      }
      const [tokenDataResultRaw] = await Promise.all([
        multicallv2(tytanAbi, [balanceCall, burnedTokenCall, totalSupplyCall], {
          requireSuccess: false,
        })
      ])

      const [totalSupply, burned, total] = tokenDataResultRaw.flat()
      const circulating = totalSupply.sub(burned)

      return {
        tytanBalance: totalSupply ? +formatBigNumber(totalSupply, 0, 5) : 0,
        burnedBalance: burned ? +formatBigNumber(burned, 0, 5) : 0,
        circulatingSupply: total && burned ? +formatBigNumber(total.sub(burned), 0, 5) : 0,
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
      <Wrapper>
        <Container>
          <StyledColumn>
            <StyledText color="textSubtle">{t('Next Reward Amount:')}</StyledText>
            {tytanBalance ? (
              <StyledBalance color="primary"  decimals={2} lineHeight="1.1" bold value={tytanBalance * 0.0004072} />
            ) : (
              <>
                <div ref={observerRef} />
                <Skeleton height={24} width={126} my="4px" />
              </>
            )}
          </StyledColumn>
          {/* <StyledColumn>
            <StyledText color="textSubtle">{t('Holders')}</StyledText>
            <StyledBalance color="primary" decimals={0} lineHeight="1.1" bold value={1205} />
          </StyledColumn> */}
          <StyledColumn>
            <StyledText color="textSubtle">{t('Market cap')}</StyledText>
            {mcap?.gt(0) && mcapString ? (
              <StyledHeading color="primary" scale="xl">{t('$%marketCap%', { marketCap: mcapString })}</StyledHeading>
            ) : (
              <Skeleton height={24} width={126} my="4px" />
            )}
          </StyledColumn>
        </Container>
      </Wrapper>
    </Grid>
  )
}

export default RebaseInfo

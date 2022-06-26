import { useState, useMemo, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { PageMeta } from 'components/Layout/Page'
import PageSection from 'components/PageSection'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import styled from 'styled-components'
import { multicallv2 } from 'utils/multicall'
import tytanAbi from 'config/abi/tytan.json'
import tokens from 'config/constants/tokens'
import { formatBigNumber, formatLocalisedCompactNumber } from 'utils/formatBalance'
import { SLOW_INTERVAL } from 'config/constants'
import { Flex, Text, Input, Button } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { usePriceCakeBusd } from 'state/farms/hooks'
import useSWR from 'swr'
import { InputGroup } from './components/Input'
import Divider from 'components/Divider'
import PrizePoolInfo from './components/PrizePoolInfo'
import { getMultipleWinnersContract } from 'utils/contractHelpers'
import { useSlowRefreshEffect } from 'hooks/useRefreshEffect'
import Deposit from './components/Deposit'
import Withdraw from './components/Withdraw'
import FaucetInfo from './components/FaucetInfo'
import Info from './components/Info'
import { useMultipleWinners } from 'hooks/useContract'
import { padStart } from 'lodash'
import { time } from 'console'

const StyledWrapper = styled(PageSection)`
  padding-top: 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding-top: 8px;
  }
`

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

const NextAward = styled(Flex)`
  width: 312px;
  justify-content: space-around;
  margin: auto;
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 25%;
  }
`

const BIG_ZERO = new BigNumber(0)

const timeLabels = ["days", "hours", "mins", "sec"]

const formatSeconds = (seconds: number) => {
  const pad = (n: number) => padStart(n.toString(), 2, "0")
  if (seconds <= 0) return [0, 0, 0, 0].map(n => pad(n))

  return [
    Math.floor(seconds / (3600 * 24)),
    Math.floor(seconds % (3600 * 24) / 3600),
    Math.floor(seconds % 3600 / 60),
    Math.floor(seconds % 60)
  ].map(n => pad(n))
}

const Play: React.FC = () => {
  const { theme } = useTheme()
  const { account } = useWeb3React()

  const multipleWinners = useMultipleWinners()

  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const formattedTimeRemaining = useMemo(() => formatSeconds(secondsRemaining), [secondsRemaining])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsRemaining(secondsRemaining - 1)
    }, 1000)
    return () => window.clearInterval(interval);
  }, [secondsRemaining]);

  useSlowRefreshEffect(() => {
    multipleWinners.prizePeriodRemainingSeconds().then(result => {
      setSecondsRemaining(result.toNumber())
    })
  }, [])

  const { t } = useTranslation()
  return (
    <>
      <PageMeta />
      <StyledWrapper
        innerProps={{ style: { margin: '0', width: '100%', maxWidth: '960px' } }}
        background={
          theme.isDark
            ? 'radial-gradient(103.12% 50% at 50% 50%, #111111 0%, #111111 100%)'
            : 'linear-gradient(139.73deg, #E6FDFF 0%, #F3EFFF 100%)'
        }
        index={2}
        hasCurvedDivider={false}
      >
        <Flex flexDirection={['column', null, null, 'row']} mb='32px'>
          <StyledColumn>
            <Text fontSize={32} textAlign="center">
              TYTAN <b>Play</b>
            </Text>
            <Text fontSize={54} color={"primary"} bold marginBottom={18}>
              $30.231,00
            </Text>
            <Text fontSize={24}>Next award in:</Text>
            <NextAward paddingBottom={24}>
              {formattedTimeRemaining.map((time, idx) => (
                <div key={idx}>
                  <Text fontSize={32} bold>{time}</Text>
                  <Text>{timeLabels[idx]}</Text>
                </div>
              ))}
            </NextAward>
          </StyledColumn>
        </Flex>

        <Info enableDeposits={secondsRemaining <= 0} />
      </StyledWrapper>
    </>
  )
}

export default Play

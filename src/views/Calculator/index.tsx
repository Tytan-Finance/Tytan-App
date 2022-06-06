import { useState, useMemo } from 'react'
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
import Earned from './components/Earned'
import { SLOW_INTERVAL } from 'config/constants'
import { Flex, Text, Input } from '@pancakeswap/uikit'
import { InputGroup } from './components/Input'
import BigNumber from 'bignumber.js'
import { usePriceCakeBusd } from 'state/farms/hooks'
import useSWR from 'swr'
import Slider, { createSliderWithTooltip } from 'rc-slider';
import 'rc-slider/assets/index.css';

const StyledHeroSection = styled(PageSection)`
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
const StyledText = styled(Text)`
  margin-bottom: 12px;
  font-size: 14px;
  ${({ theme }) => theme.mediaQueries.sm
  } {
    font-size: 24px;
  }
`

const StyledFields = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-gap: 24px 14px;

  .slider {
    height: 72px;
  }

  .rc-slider-mark-text {
    max-width: min-content;
  }

  .rc-slider-track {
    background-color: ${({ theme }) => theme.colors.backgroundAlt2};
  }

  .rc-slider-dot-active {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  .rc-slider-handle {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const BIG_ZERO = new BigNumber(0)
const RcSlider = createSliderWithTooltip(Slider)

const Calculator: React.FC = () => {
  const { theme } = useTheme()
  const { account } = useWeb3React()



  const {
    data: { myBalance } = {
      myBalance: 0,
    },
  } = useSWR(
    ['earned'],
    async () => {
      const burnedTokenCall = {
        address: tokens.tytan.address,
        name: 'balanceOf',
        params: [account],
      }
      const [tokenDataResultRaw] = await Promise.all([
        multicallv2(tytanAbi, [burnedTokenCall], {
          requireSuccess: false,
        })
      ])
      const [userBalance] = tokenDataResultRaw.flat()


      return {
        myBalance: userBalance ? +formatBigNumber(userBalance, 0, 5) : 0
      }
    },
    {
      refreshInterval: SLOW_INTERVAL,
    },
  )

  const tytanPrice = usePriceCakeBusd()
  const currentApy = 125124.33;

  const [stakeDuration, setStakeDuration] = useState(7);

  const [tytanAmount, setTytanAmount] = useState(`${myBalance}` ?? "0");
  const [apy, setApy] = useState(`${currentApy}`);
  const [tytanPurchasePrice, setTytanPurchasePrice] = useState(tytanPrice.toFixed(5));
  const [tytanFuturePrice, setTytanFuturePrice] = useState(tytanPrice.toFixed(5));

  const initialInvestment = useMemo(() => {
    let result = new BigNumber(tytanAmount ?? 0).multipliedBy(tytanPurchasePrice ?? 0)
    return result.isNaN() ? BIG_ZERO : result;
  }, [tytanAmount, tytanPurchasePrice])

  const estimatedTytanRewards = useMemo(() => {
    let dailyRate = new BigNumber((Number(apy) / 100) ** (1 / 365))
    let result = dailyRate.pow(stakeDuration).multipliedBy(tytanAmount)
    return result.isNaN() ? BIG_ZERO : result;
  }, [apy, stakeDuration, tytanAmount])

  const potentialReturn = useMemo(() => {
    let result = (new BigNumber(estimatedTytanRewards)).multipliedBy(tytanFuturePrice)
    return result.isNaN() ? BIG_ZERO : result;
  }, [estimatedTytanRewards, tytanFuturePrice])

  const { t } = useTranslation()
  return (
    <>
      <PageMeta />
      <StyledHeroSection
        innerProps={{ style: { margin: '0', width: '100%' } }}
        background={
          theme.isDark
            ? 'radial-gradient(103.12% 50% at 50% 50%, #111111 0%, #111111 100%)'
            : 'linear-gradient(139.73deg, #E6FDFF 0%, #F3EFFF 100%)'
        }
        index={2}
        hasCurvedDivider={false}
      >
        <Flex flexDirection={['column', null, null, 'row']} mb='48px'>
          <StyledColumn style={{ gridArea: 'a' }}>
            <StyledText color="textSubtle">{t('Estimated Inputs')}</StyledText>
            <StyledFields>
              <div>
                <Text>TYTAN Amount</Text>
                <InputGroup valueAction={account ? () => setTytanAmount(`${myBalance}`) : undefined} valueActionLabel={account && "MAX"}>
                  <Input
                    value={tytanAmount}
                    type="number"
                    onChange={(event) => setTytanAmount(Number(event.target.value) < 9999999999 ? event.target.value : tytanAmount)} />
                </InputGroup>

              </div>
              <div>
                <Text>APY</Text>
                <InputGroup valueAction={() => setApy(`${currentApy}`)} valueActionLabel="CURRENT">
                  <Input
                    value={apy}
                    type="number"
                    onChange={(event) => setApy(event.target.value ?? '0')} />
                </InputGroup>
              </div>
              <div>
                <Text>TYTAN Price at Purchase ($)</Text>
                <InputGroup valueAction={() => setTytanPurchasePrice(tytanPrice.toFixed(5))} valueActionLabel="CURRENT">
                  <Input
                    value={tytanPurchasePrice}
                    type="number"
                    onChange={(event) => setTytanPurchasePrice(event.target.value ?? '0')} />
                </InputGroup>
              </div>
              <div>
                <Text>Future TYTAN Price ($)</Text>
                <InputGroup valueAction={() => setTytanFuturePrice(tytanPrice.toFixed(5))} valueActionLabel="CURRENT">
                  <Input
                    value={tytanFuturePrice}
                    type="number"
                    onChange={(event) => setTytanFuturePrice(event.target.value)} />
                </InputGroup>
              </div>
              <div style={{ gridColumn: '1/span 2', padding: "6px 18px" }}>
                <Text>Staking Duration</Text>
                <RcSlider
                  min={1}
                  max={360}
                  step={1}
                  onChange={(val) => { setStakeDuration(val[0] ?? val) }}
                  value={stakeDuration}
                  marks={{ 7: '1 week', 30: '30 days', 90: '3 months', 180: '6 months', 360: '12 months' }}
                  className="slider"
                  tipFormatter={(n) => `${n} day${n > 1 ? 's' : ''}`}
                // valueLabel={`${stakeDuration.toLocaleString()} day${stakeDuration > 1 ? 's' : ''}`}
                />

              </div>

            </StyledFields>

          </StyledColumn>
          <StyledColumn style={{ gridArea: 'a' }} noMarginRight>
            <StyledText color="textSubtle">{t('Estimated Returns')}</StyledText>
            <StyledFields>
              <div>
                <Text>Your Initial Investment</Text>
                <Text bold fontSize={32} color="primary" overflow={"hidden"}>${initialInvestment?.decimalPlaces(2)?.toString() ?? 0}</Text>
              </div>
              <div>
                <Text>Your Current Wealth</Text>
                <Text bold fontSize={32} color="primary">{account ? `$${tytanPrice.multipliedBy(myBalance).toFixed(2)}` : "Connect Wallet"}</Text>
              </div>
              <div>
                <Text>EST. TYTAN Rewards</Text>
                <Text bold fontSize={32} color="primary" overflow={"hidden"}>{estimatedTytanRewards.toFixed(2)}</Text>
              </div>
              <div>
                <Text>Potential Return</Text>
                <Text bold fontSize={32} color="primary" overflow={"hidden"}>${potentialReturn.toFixed(2)}</Text>
              </div>
            </StyledFields>
          </StyledColumn>
        </Flex>
        <Earned />
      </StyledHeroSection>
    </>
  )
}

export default Calculator

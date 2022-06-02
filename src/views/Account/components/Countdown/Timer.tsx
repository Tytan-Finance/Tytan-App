import styled from 'styled-components'
import { Flex, Heading } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'

export interface TimerProps {
  seconds?: number
  minutes?: number
  hours?: number
  days?: number
  wrapperClassName?: string
}

const StyledTimerFlex = styled(Flex)<{ showTooltip?: boolean }>`
  ${({ theme, showTooltip }) => (showTooltip ? ` border-bottom: 1px dashed ${theme.colors.textSubtle};` : ``)}
  div:last-of-type {
    margin-right: 0;
  }
`

const StyledTimerText = styled(Heading)`
  background: ${({ theme }) => theme.colors.primary};
  text-align: center;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const Wrapper: React.FC<TimerProps> = ({ minutes, hours, days, seconds, wrapperClassName }) => {
  const { t } = useTranslation()

  return (
    <StyledTimerFlex alignItems="center" justifyContent="center" className={wrapperClassName}>
      {Boolean(days) && (
        <>
          <StyledTimerText mb="-4px" scale="xl" mr="4px">
            {days.toString().padStart(2, '0')}
          </StyledTimerText>
          <StyledTimerText mr="12px">{t('d')}</StyledTimerText>
        </>
      )}

      <StyledTimerText mb="-4px" scale="xl" mr="4px">
        {hours.toString().padStart(2, '0')}
      </StyledTimerText>
      <StyledTimerText mr="12px" scale="xl">{t(':')}</StyledTimerText>
      <StyledTimerText mb="-4px" scale="xl" mr="4px">
        {minutes.toString().padStart(2, '0')}
      </StyledTimerText>
      <StyledTimerText mr="12px" scale="xl">{t(':')}</StyledTimerText>
      <StyledTimerText mb="-4px" scale="xl" mr="4px">
        {seconds.toString().padStart(2, '0')}
      </StyledTimerText>
      {/* <StyledTimerText mr="12px" scale="xl" >{t('s')}</StyledTimerText> */}
    </StyledTimerFlex>
  )
}

export default Wrapper

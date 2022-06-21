import { Currency, Pair, Token } from '@orbitalswap/sdk'
import { Button, ChevronDownIcon, Text, useModal, Flex, Box, MetamaskIcon } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { registerToken } from 'utils/wallet'
import { isAddress } from 'utils'
import { useTranslation } from 'contexts/Localization'
import { WrappedTokenInfo } from 'state/types'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useCurrencyBalance } from 'state/wallet/hooks'

import { Input as NumericalInput } from './NumericalInput'

const InputRow = styled.div<{ selected: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-end;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`
const CurrencySelectButton = styled(Button).attrs({ variant: 'text', scale: 'sm' })`
  padding: 0 0.5rem;
`
const LabelRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem;
`
const InputPanel = styled.div`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  z-index: 1;
`
const Container = styled.div`
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.input};
  box-shadow: ${({ theme }) => theme.shadows.inset};
`
interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
}
export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
}: CurrencyInputPanelProps) {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()

  return (
    <Flex flexDirection="column" flex={1} mt={3}>
      <InputPanel>
        <Container as="label">
          <LabelRow>
            <NumericalInput
              className="token-amount-input"
              align="left"
              value={value}
              onUserInput={(val) => {
                onUserInput(val)
              }}
            />
            <Button onClick={onMax} scale="xs" variant="secondary">
              {t('Max').toLocaleUpperCase(locale)}
            </Button>
          </LabelRow>
        </Container>
      </InputPanel>
    </Flex>
  )
}

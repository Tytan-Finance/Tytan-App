import { Button, ButtonMenu, ButtonMenuItem,  Flex, Skeleton, Text  } from '@pancakeswap/uikit'
import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'

import unserializedTokens from 'config/constants/tokens'
import { useTranslation } from 'contexts/Localization'
import { PageMeta } from 'components/Layout/Page'
import PageSection from 'components/PageSection'
import { ToastDescriptionWithTx } from 'components/Toast'
import useTheme from 'hooks/useTheme'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useCatchTxError from 'hooks/useCatchTxError'
import useToast from 'hooks/useToast'
import Balance from 'components/Balance'
import { useSlowRefreshEffect } from 'hooks/useRefreshEffect'
import { getTytanContract, getWTytanContract } from 'utils/contractHelpers'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { getBalanceAmount, getDecimalAmount } from 'utils/formatBalance'
import useApprove from './hooks/useApprove'
import CurrencyInputPanel from './components/CurrencyInputPanel'
import useWrap from './hooks/useWrap'
import useAllowance from './hooks/useAllowance'

const StyledHeroSection = styled(PageSection)`
  padding-top: 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding-top: 8px;
  }
`
const StyledBalance = styled(Balance)`
  font-size: 24px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 40px;
  }
`

const StyledColumn = styled.div<{noMarginRight?: boolean}>`
  text-align: center;
  background: #222222;
  width: 100%;
  max-width: 600px;
  border: 1px rgb(22, 23, 46) solid;
  border-radius: 16px;
  box-shadow: rgb(0 0 0 / 50%) 10px 10px 20px 0px;
  position: relative;
  padding: 32px 16px;
`

const StyledText = styled(Text)`
  margin-bottom: 12px;
  font-size: 14px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 24px;
  }
`

const Wrap: React.FC = () => {
  const { theme } = useTheme()
  const { account } = useActiveWeb3React()
  const { t } = useTranslation()

  const wrapFee = 0.01

  const tytanContract = getTytanContract()
  const wTytanContract = getWTytanContract()

  const [currentIndex, setCurrentIndex] = useState(1)
  const [wrapOption, setWrapOption] = useState(0)
  const [value, setValue] = useState("0")
  const [expectedAmount, setExpectedAmount] = useState(0)
  const [adjustedBalance, setAdjustedBalance] = useState(0)


  const tytanBalance = useCurrencyBalance(account, unserializedTokens.tytan)
  const wTytanBalance = useCurrencyBalance(account, unserializedTokens.wtytan)

  const tytanAllowance = useAllowance(unserializedTokens.tytan, account)
  const wTytanAllowance = useAllowance(unserializedTokens.wtytan, account)

  const { onApprove: onTytanApprove} = useApprove(unserializedTokens.tytan.address)
  const { onApprove: onWTytanApprove} = useApprove(unserializedTokens.wtytan.address)
  const { onWrap, onUnwrap } = useWrap()
  
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { toastSuccess } = useToast()

  useSlowRefreshEffect(() => {
    tytanContract.index().then((res) => {
      setCurrentIndex(getBalanceAmount(new BigNumber(res._hex), 5).toNumber())
    })
  }, [tytanContract])

  useEffect(() => {
    const convertedInput = getDecimalAmount(
      new BigNumber(value === "" ? "0" : value), 
      wrapOption ? unserializedTokens.wtytan.decimals : unserializedTokens.tytan.decimals
    )

    const fetchData = async () => {
      let res
      if(wrapOption) {
        res = await wTytanContract.wrapToTytan(convertedInput.toString())
        setExpectedAmount(
          getBalanceAmount(
            new BigNumber(res._hex).multipliedBy(1 - wrapFee), 
            unserializedTokens.tytan.decimals
          ).toNumber()
        )
      } else {
        res = await wTytanContract.tytanToWrap(convertedInput.toString())
        setExpectedAmount(
          getBalanceAmount(
            new BigNumber(res._hex).multipliedBy(1 - wrapFee), 
            unserializedTokens.wtytan.decimals
          ).toNumber()
        )
      }
    }

    fetchData()
  }, [value, wrapOption, wTytanContract])

  useEffect(() => {
    const convertedInput = getDecimalAmount(
      new BigNumber(wTytanBalance?.toExact() ?? "0"), 
      unserializedTokens.wtytan.decimals
    )

    const fetchData = async () => {
      const res = await wTytanContract.wrapToTytan(convertedInput.toString())
        setAdjustedBalance(
          getBalanceAmount(
            new BigNumber(res._hex).multipliedBy(1 - wrapFee), 
            unserializedTokens.tytan.decimals
          ).toNumber()
        )
    }

    fetchData()
  }, [wTytanBalance, wrapOption, wTytanContract])
  
  
  const handleUserInput = (amount) =>  {
    setValue(amount)
  }

  const handleMaxInput = () => {
    setValue(wrapOption ? wTytanBalance.toExact() : tytanBalance.toExact())
  }

  const wrapOptionChanged = () => {
    setValue("0")
    setWrapOption(1 - wrapOption)
  }

  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      if(wrapOption) return onWTytanApprove()
      return onTytanApprove()
    })
    if (receipt?.status) {
      toastSuccess(t('Token Approved'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
    }
  }, [onTytanApprove, onWTytanApprove, wrapOption, t, toastSuccess, fetchWithCatchTxError])

  const handleWrap = useCallback(async () => {
    const convertedInput = getDecimalAmount(new BigNumber(value), unserializedTokens.tytan.decimals)
    const receipt = await fetchWithCatchTxError(() => {
      return onWrap(convertedInput)
    })
    if (receipt?.status) {
      toastSuccess(t('TYTAN Wrapped'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
    }
  }, [onWrap, value, t, toastSuccess, fetchWithCatchTxError])

  const handleUnwrap = useCallback(async () => {
    const convertedInput = getDecimalAmount(new BigNumber(value), unserializedTokens.wtytan.decimals)
    const receipt = await fetchWithCatchTxError(() => {
      return onUnwrap(convertedInput)
    })
    if (receipt?.status) {
      toastSuccess(t('TYTAN Unwrapped'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
    }
  }, [onUnwrap, value, t, toastSuccess, fetchWithCatchTxError])  

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
        <Flex justifyContent="center" my={3}>
          <StyledColumn style={{ gridArea: 'a' }} noMarginRight>
            <StyledText textAlign="left">Wrap TYTAN</StyledText>
            <Text>
              wTYTAN is an index-adjusted wrapper for TYTAN. Unlike your TYTAN balance, your wTYTAN balance will not increase over time. When wTYTAN is unwrapped, you receive TYTAN based on the latest (ever-increasing) index, so the total yield is the same.
            </Text>
            
            <Flex justifyContent="center" mt={4}>
              <ButtonMenu mr={5} scale="sm" variant='subtle' activeIndex={wrapOption} onItemClick={wrapOptionChanged}>
                <ButtonMenuItem>{t('Wrap')}</ButtonMenuItem>
                <ButtonMenuItem>{t('Unwrap')}</ButtonMenuItem>
              </ButtonMenu>
            </Flex>
            <Flex justifyContent="space-between" alignItems="end" mt={3}>
              <CurrencyInputPanel
                value={value}
                onUserInput={handleUserInput}
                onMax={handleMaxInput}
              />
              { (wrapOption === 0 && !tytanAllowance?.gt(0)) ? (
                <Button 
                  variant='primary' ml={2}
                  disabled={pendingTx}
                  onClick={handleApprove}
                  >
                    {t('Approve')}
                </Button>
              ): (
                <Button 
                  variant='primary' ml={2}
                  disabled={pendingTx}
                  onClick={wrapOption ? handleUnwrap : handleWrap}
                  >
                    {wrapOption ? t('Unwrap') : t('Wrap')}
                </Button>
              )}
            </Flex>

            <Flex justifyContent="space-between" mt={4} mx={3}>
              <Text>Your Balance (TYTAN)</Text>
              <Text>{tytanBalance ? tytanBalance.toExact() : "0.00000"} TYTAN</Text>
            </Flex>
            <Flex justifyContent="space-between" mt={1} mx={3}>
              <Text>Your Balance (Wrapped)</Text>
              <Text>{wTytanBalance ? wTytanBalance.toExact() : "0.00000"} wTYTAN</Text>
            </Flex>
            <Flex justifyContent="space-between" mt={2} mx={3}>
              <Text>Current Index</Text>
              <Text>{currentIndex}</Text>
            </Flex>
            <Flex justifyContent="space-between" mt={1} mx={3}>
              <Text>Index-adjusted Balance</Text>
              <Text>{adjustedBalance} {unserializedTokens.tytan.symbol}</Text>
            </Flex>
            <Flex justifyContent="space-between" mt={1} mx={3}>
              <Text>You Will Get</Text>
              <Text>{expectedAmount} {wrapOption ? unserializedTokens.tytan.symbol : unserializedTokens.wtytan.symbol}</Text>
            </Flex>          
            
          </StyledColumn>
        </Flex>    
      </StyledHeroSection>
    </>
  )
}

export default Wrap

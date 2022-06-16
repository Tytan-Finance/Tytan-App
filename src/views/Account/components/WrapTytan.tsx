import { Button, Flex, Heading, Skeleton, Text, BalanceInput } from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
import Balance from 'components/Balance'
import tytanAbi from 'config/abi/tytan.json'
import tokens from 'config/constants/tokens'
import { useTranslation } from 'contexts/Localization'
import { useWTytan, useTytan } from 'hooks/useContract'
import { MaxUint256 } from '@ethersproject/constants'
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
import ApproveConfirmButtons from 'components/ApproveConfirmButtons'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { ToastDescriptionWithTx } from 'components/Toast'
import useToast from 'hooks/useToast'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { requiresApproval } from 'utils/requiresApproval'

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

const WrapTytan = () => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const { observerRef, isIntersecting } = useIntersectionObserver()
  const [loadData, setLoadData] = useState(false)
  const { toastSuccess } = useToast()
  const { reader: tytanContractReader, signer: tytanContractApprover } = useTytan()
  const { reader: wTytanContract } = useWTytan()
  const { callWithGasPrice } = useCallWithGasPrice()
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
  const [amount, setAmount] = useState('')
  const { isApproving, isApproved, isConfirmed, isConfirming, handleApprove, handleConfirm } =
  // useApproveConfirmTransaction({
  //   onRequiresApproval: async () => {
  //     return requiresApproval(tytanContractReader, account, wTytanContract.address)
  //   },
  //   onApprove: () => {
  //     return callWithGasPrice(tytanContractReader, 'approve', [wTytanContract.address, MaxUint256])
  //   },
  //   onConfirm: () => {
  //     return callWithGasPrice(wTytanContract, 'wrap', [
  //       teamId,
  //       selectedNft.collectionAddress,
  //       selectedNft.tokenId,
  //     ])
  //   },
  //   onSuccess: async ({ receipt }) => {
  //     refreshProfile()
  //     onDismiss()
  //     toastSuccess(t('Profile created!'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
  //   },
  // })
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
              <StyledBalance color="primary"  decimals={2} lineHeight="1.0" bold value={tytanBalance * 0.0004072} unit=" TYTAN" />
            ) : (
              <>
                <div ref={observerRef} />
                <Skeleton height={24} width={126} my="4px" />
              </>
            )}
          </StyledColumn>
          {/* <BalanceInput
          isWarning={!isMultipleOfTen || isInvalidFirstBid}
          placeholder="0"
          value={bid}
          onUserInput={handleInputChange}
          currencyValue={
            cakePriceBusd.gt(0) &&
            `~${bid ? cakePriceBusd.times(new BigNumber(bid)).toNumber().toLocaleString() : '0.00'} USD`
          }
        /> */}
          {/* <StyledColumn>
            {account ? (
              <>
                <ApproveConfirmButtons
                  isApproveDisabled={isApproved}
                  isApproving={isApproving}
                  isConfirmDisabled={disableBuying}
                  isConfirming={isConfirming}
                  onApprove={handleApprove}
                  onConfirm={handleConfirm}
                  buttonArrangement={ButtonArrangement.SEQUENTIAL}
                  confirmLabel={t('Buy Instantly')}
                  confirmId="lotteryBuyInstant"
                />
              </>
            ) : (
              <ConnectWalletButton />
            )}
          </StyledColumn> */}
        </Container>
      </Wrapper>
    </Grid>
  )
}

export default WrapTytan

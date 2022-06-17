import { useCallback } from 'react'
import { MaxUint256 } from '@ethersproject/constants'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import unserializedTokens from 'config/constants/tokens'
import { useERC20 } from 'hooks/useContract'

const useApprove = (tokenAddress: string) => {
  const { callWithGasPrice } = useCallWithGasPrice()
  const tokenContract = useERC20(tokenAddress)

  const handleApprove = useCallback(async () => {
    return callWithGasPrice(tokenContract, 'approve', [unserializedTokens.wtytan.address, MaxUint256])
  }, [tokenContract, callWithGasPrice])

  return { onApprove: handleApprove }
}

export default useApprove

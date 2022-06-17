import { useCallback } from 'react'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useWTytan } from 'hooks/useContract'
import BigNumber from 'bignumber.js'
import unserializedTokens from 'config/constants/tokens'

const useWrap = () => {
  const { callWithGasPrice } = useCallWithGasPrice()
  const {signer: wTytanContract} = useWTytan()
  
  const handleWrap = useCallback(async (amount) => {
    return callWithGasPrice(wTytanContract, 'wrap', [amount.toString()])
  }, [wTytanContract, callWithGasPrice])

  const handleUnwrap = useCallback(async (amount) => {
    return callWithGasPrice(wTytanContract, 'unwrap', [amount.toString()])
  }, [wTytanContract, callWithGasPrice])

  return { 
    onWrap: handleWrap, 
    onUnwrap: handleUnwrap 
  }
}

export default useWrap

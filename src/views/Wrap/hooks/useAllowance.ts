import { Token } from '@orbitalswap/sdk'
import BigNumber from 'bignumber.js'
import unserializedTokens from 'config/constants/tokens'
import { useTokenContract } from 'hooks/useContract'
import { useSingleCallResult } from 'state/multicall/hooks'
import { BIG_ZERO } from 'utils/bigNumber'


function useAllowance(token?: Token, owner?: string): BigNumber {
  const wTytanAddress = unserializedTokens.wtytan.address
  
  const contract = useTokenContract(token?.address, false)
  const allowance = useSingleCallResult(contract, 'allowance', [owner, wTytanAddress]).result

  return allowance ? new BigNumber(allowance.toString()) : BIG_ZERO
}

export default useAllowance

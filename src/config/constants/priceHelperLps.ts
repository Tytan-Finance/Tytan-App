import tokens from './tokens'
import { SerializedFarmConfig } from './types'

const priceHelperLps: SerializedFarmConfig[] = [
  /**
   * These LPs are just used to help with price calculation for MasterChef LPs (farms.ts).
   * This list is added to the MasterChefLps and passed to fetchFarm. The calls to get contract information about the token/quoteToken in the LP are still made.
   * The absence of a PID means the masterchef contract calls are skipped for this farm.
   * Prices are then fetched for all farms (masterchef + priceHelperLps).
   * Before storing to redux, farms without a PID are filtered out.
   */
  // {
  //   pid: null,
  //   lpSymbol: 'TYTAN-BNB LP',
  //   lpAddresses: {
  //     97: '',
  //     56: '0x71125dfF884402eFFF470476440946eF04b56180',
  //   },
  //   token: tokens.tytan,
  //   quoteToken: tokens.wbnb,
  // },
]

export default priceHelperLps

import { ContextApi } from 'contexts/Localization/types'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: 'Tytan',
  description:
    "We've travelled the wormholes of the rebase galaxy far & wide. Only to find the future is TYTAN. With immediate utility on launch. Strap in and feel the G-force of rebase at its finest.",
  image: 'https://app.tytan.finance/images/hero.png',
}

export const getCustomMeta = (path: string, t: ContextApi['t']): PageMeta => {
  let basePath
  if (path.startsWith('/swap')) {
    basePath = '/swap'
  } else if (path.startsWith('/add')) {
    basePath = '/add'
  } else if (path.startsWith('/remove')) {
    basePath = '/remove'
  } else if (path.startsWith('/teams')) {
    basePath = '/teams'
  } else if (path.startsWith('/voting/proposal') && path !== '/voting/proposal/create') {
    basePath = '/voting/proposal'
  } else if (path.startsWith('/nfts/collections')) {
    basePath = '/nfts/collections'
  } else if (path.startsWith('/nfts/profile')) {
    basePath = '/nfts/profile'
  } else if (path.startsWith('/pancake-squad')) {
    basePath = '/pancake-squad'
  } else {
    basePath = path
  }

  switch (basePath) {
    case '/':
      return {
        title: `${t('Home')} | ${t('Tytan')}`,
      }
    case '/swap':
      return {
        title: `${t('Exchange')} | ${t('Tytan')}`,
      }
    case '/account':
      return {
        title: `${t('Account')} | ${t('Tytan')}`,
      }
    case '/calculator':
      return {
        title: `${t('Calculator')} | ${t('Tytan')}`,
      }
    case '/add':
      return {
        title: `${t('Add Liquidity')} | ${t('Tytan')}`,
      }
    case '/remove':
      return {
        title: `${t('Remove Liquidity')} | ${t('Tytan')}`,
      }
    case '/liquidity':
      return {
        title: `${t('Liquidity')} | ${t('Tytan')}`,
      }
    case '/find':
      return {
        title: `${t('Import Pool')} | ${t('Tytan')}`,
      }
    case '/competition':
      return {
        title: `${t('Trading Battle')} | ${t('Tytan')}`,
      }
    case '/prediction':
      return {
        title: `${t('Prediction')} | ${t('Tytan')}`,
      }
    case '/prediction/leaderboard':
      return {
        title: `${t('Leaderboard')} | ${t('Tytan')}`,
      }
    case '/farms':
      return {
        title: `${t('Farms')} | ${t('Tytan')}`,
      }
    case '/farms/auction':
      return {
        title: `${t('Farm Auctions')} | ${t('Tytan')}`,
      }
    case '/pools':
      return {
        title: `${t('Pools')} | ${t('Tytan')}`,
      }
    case '/lottery':
      return {
        title: `${t('Lottery')} | ${t('Tytan')}`,
      }
    case '/ifo':
      return {
        title: `${t('Initial Farm Offering')} | ${t('Tytan')}`,
      }
    case '/teams':
      return {
        title: `${t('Leaderboard')} | ${t('Tytan')}`,
      }
    case '/voting':
      return {
        title: `${t('Voting')} | ${t('Tytan')}`,
      }
    case '/voting/proposal':
      return {
        title: `${t('Proposals')} | ${t('Tytan')}`,
      }
    case '/voting/proposal/create':
      return {
        title: `${t('Make a Proposal')} | ${t('Tytan')}`,
      }
    case '/info':
      return {
        title: `${t('Overview')} | ${t('Tytan Info & Analytics')}`,
        description: 'View statistics for Pancakeswap exchanges.',
      }
    case '/info/pools':
      return {
        title: `${t('Pools')} | ${t('Tytan Info & Analytics')}`,
        description: 'View statistics for Pancakeswap exchanges.',
      }
    case '/info/tokens':
      return {
        title: `${t('Tokens')} | ${t('Tytan Info & Analytics')}`,
        description: 'View statistics for Pancakeswap exchanges.',
      }
    case '/nfts':
      return {
        title: `${t('Overview')} | ${t('Tytan')}`,
      }
    case '/nfts/collections':
      return {
        title: `${t('Collections')} | ${t('Tytan')}`,
      }
    case '/nfts/activity':
      return {
        title: `${t('Activity')} | ${t('Tytan')}`,
      }
    case '/nfts/profile':
      return {
        title: `${t('Profile')} | ${t('Tytan')}`,
      }
    case '/pancake-squad':
      return {
        title: `${t('Pancake Squad')} | ${t('Tytan')}`,
      }
    default:
      return null
  }
}

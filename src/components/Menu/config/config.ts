import {
  MenuItemsType,
  DropdownMenuItemType,
  SwapIcon,
  SwapFillIcon,
  EarnFillIcon,
  EarnIcon,
  TrophyIcon,
  TrophyFillIcon,
  NftIcon,
  NftFillIcon,
  MoreIcon,
  HomeIcon,
  AccountIcon,
  AccountFilledIcon
} from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'
import { nftsBaseUrl } from 'views/Nft/market/constants'
import { perpLangMap } from 'utils/getPerpetualLanguageCode'
import { DropdownMenuItems } from '@pancakeswap/uikit/src/components/DropdownMenu/types'

export type ConfigMenuDropDownItemsType = DropdownMenuItems & { hideSubNav?: boolean }
export type ConfigMenuItemsType = Omit<MenuItemsType, 'items'> & { hideSubNav?: boolean } & {
  items?: ConfigMenuDropDownItemsType[]
}

const config: (t: ContextApi['t'], languageCode?: string) => ConfigMenuItemsType[] = (t, languageCode) => [
  {
    label: t('Dashboard'),
    icon: HomeIcon,
    href: '/',
    showItemsOnMobile: false,
    items:[]
  },
  {
    label: t('Account'),
    icon: AccountIcon,
    fillIcon: AccountFilledIcon,
    href: '/account',
    showItemsOnMobile: false,
    items: [],
  },
  {
    label: t('Trade'),
    icon: SwapIcon,
    fillIcon: SwapFillIcon,
    href: '/swap',
    showItemsOnMobile: false,
    items: [
      {
        label: t('Swap'),
        href: '/swap',
      },
      {
        label: t('Liquidity'),
        href: '/liquidity',
      },
    ],
  },
  // {
  //   label: t('Calculator'),
  //   icon: SwapIcon,
  //   href: '/calculator',
  //   showItemsOnMobile: false,
  //   items: [],
  // },
  {
    label: '',
    href: '/info',
    icon: MoreIcon,
    hideSubNav: true,
    items: [
      {
        label: t('Chart'),
        href: 'https://dexscreener.com/bsc/0x71125dff884402efff470476440946ef04b56180',
        type: DropdownMenuItemType.EXTERNAL_LINK,
      },
      {
        label: t('Docs'),
        href: 'https://docs.tytan.finance',
        type: DropdownMenuItemType.EXTERNAL_LINK,
      },
    ],
  },
]

export default config

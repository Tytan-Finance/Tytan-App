import { FooterLinkType } from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'

export const footerLinks: (t: ContextApi['t']) => FooterLinkType[] = (t) => [
  // {
  //   label: t('About'),
  //   items: [
  //     {
  //       label: t('Contact'),
  //       href: 'https://docs.tytan.finance/contact-us',
  //     },
  //     {
  //       label: t('Community'),
  //       href: 'https://docs.tytan.finance/contact-us',
  //       // isHighlighted: true,
  //     },
  //   ],
  // },
  // {
  //   label: t('Help'),
  //   items: [
  //     {
  //       label: t('Customer Support'),
  //       href: 'https://docs.tytan.finance/contact-us/customer-support',
  //     },
  //     {
  //       label: t('Troubleshooting'),
  //       href: 'https://docs.tytan.finance/help/troubleshooting',
  //     },
  //     {
  //       label: t('Guides'),
  //       href: 'https://docs.tytan.finance/get-started',
  //     },
  //   ],
  // },
]

import { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { PageMeta } from 'components/Layout/Page'
import PageSection from 'components/PageSection'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import styled from 'styled-components'
import Earned from './components/Earned'
import Earnings from './components/Earnings'
import RebaseInfo from './components/RebaseInfo'
import WrapTytan from './components/WrapTytan'

const StyledHeroSection = styled(PageSection)`
  padding-top: 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding-top: 8px;
  }
`

const Account: React.FC = () => {
  const { theme } = useTheme()
  const { account } = useWeb3React()


  const { t } = useTranslation()
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
        <Earned />
        <Earnings />
        <RebaseInfo />
        <WrapTytan />
      </StyledHeroSection>
    </>
  )
}

export default Account

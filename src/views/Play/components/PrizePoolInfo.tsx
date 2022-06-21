import { Flex, Text } from "@pancakeswap/uikit"
import Divider from "components/Divider"
import styled from "styled-components"

const StyledColumn = styled.div<{ noMarginRight?: boolean }>`
  text-align: center;
  background: #222222;
  width: 100%;
  border: 1px solid rgb(22, 23, 46);
  border-radius: 16px;
  box-shadow: rgb(0 0 0 / 50%) 10px 10px 20px 0px;
  position: relative;
  padding: 16px 16px;
  ${({ noMarginRight, theme }) =>
    noMarginRight
      ? `
      margin-right: 24px;
      ${theme.mediaQueries.sm}{
        margin-right: 0px;
      }
      `
      : `
      margin-right: 24px;
      margin-bottom: 24px;
      ${theme.mediaQueries.sm}{
        margin-bottom: 24px;
      }
      ${theme.mediaQueries.md}{
        margin-bottom: 0px;
      }
      `}
`

const PrizePoolInfo: React.FC = () => {
  return (
    <Flex flexDirection={['column', null, null, 'row']} mb='48px'>
      <StyledColumn>
        <Text fontSize={32}>Prize Pool Info</Text>
        <Flex justifyContent="space-between">
          <Text>Your Total Awards:</Text>
          <Text>TODO</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text>Your Pool Deposits:</Text>
          <Text>TODO%</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text>Your odds:</Text>
          <Text>TODO</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text>Your Wallet Balance</Text>
          <Text>TODO</Text>
        </Flex>

        <Divider />
        <Flex justifyContent="space-between">
          <Text>Number Of Winners:</Text>
          <Text>TODO%</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text>Total Deposits:</Text>
          <Text>TODO%</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text>Early exit fee:</Text>
          <Text>TODO%</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text>Exit fee decay time</Text>
          <Text>TODO</Text>
        </Flex>
      </StyledColumn>
    </Flex>
  )
}

export default PrizePoolInfo
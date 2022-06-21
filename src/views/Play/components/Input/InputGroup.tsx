import React, { cloneElement } from "react";
import styled from "styled-components";
import { Box, Input, Text } from "@pancakeswap/uikit";
import { InputGroupProps, scales, Scales } from "./types";

const getPadding = (scale: Scales, hasIcon: boolean) => {
  if (!hasIcon) {
    return "16px";
  }

  switch (scale) {
    case scales.SM:
      return "32px";
    case scales.LG:
      return "56px";
    case scales.MD:
    default:
      return "48px";
  }
};

const StyledInputGroup = styled(Box) <{ scale: Scales; }>`
  ${Input} {
    padding-right: 64px;
  }
`;

const ValueAction = styled.button<{ scale: Scales; isEndIcon?: boolean }>`
  border: 0;
  background-color: transparent;
  align-items: center;
  display: flex;
  height: 100%;
  position: absolute;
  top: 0;
  cursor: pointer;

  right: 8px;
`;

const InputGroup = ({ scale = scales.MD, valueActionLabel, valueAction, children, ...props }: InputGroupProps): JSX.Element => (
  <StyledInputGroup
    scale={scale}
    width="100%"
    position="relative"
    {...props}
  >
    {cloneElement(children, { scale })}
    {valueAction && (
      <ValueAction scale={scale} onClick={valueAction}>
        <Text fontSize="14px">{valueActionLabel}</Text>
      </ValueAction>
    )}
  </StyledInputGroup>
);

export default InputGroup;

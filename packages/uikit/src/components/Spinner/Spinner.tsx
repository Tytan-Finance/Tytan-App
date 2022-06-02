import React from "react";
import styled, { keyframes } from "styled-components";
import PanIcon from "./PanIcon";
import PancakeIcon from "./PancakeIcon";
import { SpinnerProps } from "./types";

const rotate = keyframes`
  0% {
    transform: transalate(0px, 0px);
  }
  25% {
    transform: translate(120px, 120px);
  }
  50% {
    transform: translate(0px, 0px);
  }
  75% {
    transform: translate(120px, 120px);
  }
  100% {
    transform: translate(0px, 0px);
  }
`;

const float = keyframes`
10% { transform: scale(1); }
20% { transform: scale(1.1); }
30% { transform: scale(1.2); }
40% { transform: scale(1.3); }
50% { transform: scale(1.4); }
60% { transform: scale(1.5); }
70% { transform: scale(1.3); }
80% { transform: scale(1.2); }
90% { transform: scale(1.1); }
100% { transform: scale(1); }
`;

const Container = styled.div`
  position: relative;
`;

const RotatingPancakeIcon = styled(PancakeIcon)`
  position: absolute;
  top: 0;
  left: 0;
  animation: ${rotate} 4s linear infinite;
  transform: translate3d(0, 0, 0);
  z-index: 1;
`;

const FloatingPanIcon = styled(PanIcon)`
  animation: ${float} 6s ease-in-out infinite;
  transform: translate3d(0, 0, 0);
`;

const Spinner: React.FC<SpinnerProps> = ({ size = 128 }) => {
  return (
    <Container>
      <RotatingPancakeIcon width={`${size * 0.2}px`} />
      <FloatingPanIcon width={`${size}px`} />
    </Container>
  );
};

export default Spinner;

import React from "react";
import Svg from "../Svg/Svg";
import { SvgProps } from "../Svg/types";

const Icon: React.FC<SvgProps> = (props) => {
  return (
    <Svg viewBox="0 0 14 14" {...props}>
      <path d="M7.21509 13.7713C10.8063 13.7713 13.7175 10.8675 13.7175 7.28545C13.7175 3.70343 10.8063 0.799622 7.21509 0.799622C3.62389 0.799622 0.712646 3.70343 0.712646 7.28545C0.712646 10.8675 3.62389 13.7713 7.21509 13.7713Z" fill="#00FFA3"/>
    </Svg>
  );
};

export default Icon;

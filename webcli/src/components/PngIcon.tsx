import React from 'react'

import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'

interface Props extends React.HTMLProps<SvgIconProps> {
  ariaHidden?: boolean;
  ariaLabel?: string;
  className?: string;
  src: string;
}

export const PngIcon: React.FC<Props> = (props) => {
  const {
    ariaHidden,
    ariaLabel,
    className,
    src
  } = props

  return (
    <SvgIcon
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
      className={className}
      component="span"
      viewBox=""
    >
      <svg width='1em' height='1em' fill='none' xmlns='https://www.w3.org/2000/svg'>
        <image width="1em" height="1em" xlinkHref={src} ></image>
      </svg>
    </SvgIcon>
  )
}

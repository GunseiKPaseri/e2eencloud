import React from 'react'

import { alpha, styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { SvgIconProps } from '@mui/material/SvgIcon'

import TreeItem, { TreeItemProps, treeItemClasses } from '@mui/lab/TreeItem'

declare module 'react' {
  // eslint-disable-next-line no-unused-vars
  interface CSSProperties {
    '--tree-view-color'? : CSSProperties['color'],
    '--tree-view-bg-color'? : CSSProperties['color']
  }
}

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3
    }
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: theme.spacing(2),
    paddingLeft: theme.spacing(2.5),
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`
  }
}))

const StyledTreeItem = ({
  bgColor,
  color,
  labelIcon,
  labelInfo,
  labelText,
  style,
  ...other
}: TreeItemProps & {
  bgColor?: React.CSSProperties['color'];
  labelIcon?: React.ElementType<SvgIconProps>;
  labelInfo?: string;
  labelText: string;
}) => {
  const trueStyle: React.CSSProperties = {
    '--tree-view-color': color,
    '--tree-view-bg-color': bgColor,
    ...style
  }

  return (
    <StyledTreeItemRoot
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
          <Box component={labelIcon} color="inherit" sx={{ mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </Box>
      }
      style={trueStyle}
      {...other}
    />
  )
}

export default StyledTreeItem

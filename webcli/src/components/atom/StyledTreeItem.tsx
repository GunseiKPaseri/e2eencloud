import React from 'react';
import TreeItem, {
  type TreeItemProps,
  treeItemClasses,
} from '@mui/lab/TreeItem';
import Box from '@mui/material/Box';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';

declare module 'react' {
  interface CSSProperties {
    '--tree-view-color'?: CSSProperties['color'];
    '--tree-view-bg-color'?: CSSProperties['color'];
  }
}

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    marginLeft: theme.spacing(2),
    paddingLeft: theme.spacing(2.5),
  },
}));

function StyledTreeItem({
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
}) {
  const trueStyle: React.CSSProperties = {
    '--tree-view-bg-color': bgColor,
    '--tree-view-color': color,
    ...style,
  };

  return (
    <StyledTreeItemRoot
      label={
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            p: 0.5,
            pr: 0,
          }}
        >
          <Box component={labelIcon} color='inherit' sx={{ mr: 1 }} />
          <Typography
            variant='body2'
            sx={{ flexGrow: 1, fontWeight: 'inherit' }}
          >
            {labelText}
          </Typography>
          <Typography variant='caption' color='inherit'>
            {labelInfo}
          </Typography>
        </Box>
      }
      style={trueStyle}
      {...other}
    />
  );
}

export default StyledTreeItem;

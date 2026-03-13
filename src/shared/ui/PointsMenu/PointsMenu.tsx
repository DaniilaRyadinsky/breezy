import React from 'react'

import {  IconButton,  Menu, MenuItem} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type {Option} from '../../model/types'


interface IPointsMenu {
  options: Option[],
}

const ITEM_HEIGHT = 48;

const PointsMenu = ({ options }: IPointsMenu) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onCLick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, action: () => void) => {
    e.stopPropagation()
    action();
    handleClose()
  }

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: '20ch',
            },
          },
          list: {
            'aria-labelledby': 'long-button',
          },
        }}
      >
        {options.map((option, index) => (
          <MenuItem key={index} onClick={(e) => onCLick(e, option.action)}>
            {option.title}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}

export default PointsMenu
// Topbar.jsx
import { AppBar, IconButton, Toolbar, Avatar } from '@mui/material';
import React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../../images/logo.png';
import { TopbarStyle } from './TopbarStyle';

function Topbar({ handleDrawerToggle }) {
  const classes = TopbarStyle();

  return (
    <AppBar 
      position='fixed' 
      elevation={1}
      sx={{ 
        zIndex: 1201,
        backgroundColor: '#011117',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <div className={classes.topbarContent}>
          <Avatar
            variant='square'
            alt='FixMyCity'
            src={logo}
            className={classes.topbarLogo}
          />
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;
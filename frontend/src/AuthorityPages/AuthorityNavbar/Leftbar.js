// Leftbar.jsx
import React from 'react';
import { Drawer, useMediaQuery, useTheme, Box } from '@mui/material';
import LeftbarDesign from './LeftbarDesign';

function Leftbar({ mobileOpen, handleDrawerToggle }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const drawerWidth = 200;

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 },
      }}
    >
      {/* Sidebar Navigation */}
      {isDesktop ? (
        <Drawer
          variant="permanent"
          open
          anchor="left"
          PaperProps={{
            sx: {
              width: drawerWidth,
              color: 'white',
              backgroundColor: '#011117',
              height: '100%',
              top: 0,
            },
          }}
        >
          <LeftbarDesign />
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          anchor="left"
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: drawerWidth,
              color: 'white',
              backgroundColor: '#011117',
              zIndex: 1200, // Lower than AppBar zIndex (1201)
            },
          }}
        >
          <LeftbarDesign />
        </Drawer>
      )}
    </Box>
  );
}

export default Leftbar;
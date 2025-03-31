// Layout.jsx
import React, { useState } from 'react';
import Leftbar from './Leftbar';
import Topbar from './Topbar'; // Import the Topbar component
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Left Sidebar */}
      <Leftbar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
      />
      
      <Box sx={{ flexGrow: 1 }}>
        {/* Topbar only visible on mobile devices */}
        {isMobile && (
          <Topbar handleDrawerToggle={handleDrawerToggle} />
        )}
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            p: 0,
            m: 0,
            backgroundColor: '#eaeff1',
            minHeight: '100vh',
            overflowX: 'hidden',
            pt: isMobile ? '64px' : 0, // Add padding top only on mobile
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
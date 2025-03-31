import React from 'react';
import { Avatar, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import logo from '../../images/logo.png';
import { LeftbarStyle } from './LeftbarStyle';
import { LeftbarData } from './LeftbarData';
import { useNavigate, useLocation } from 'react-router';

function LeftbarDesign() {
  const classes = LeftbarStyle();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div>
      <div className={classes.logoDiv}>
        <Avatar
          alt="FixmyCity"
          src={logo}
          variant="square"
          className={classes.logoStyle}
          sx={{
            width: 90,      // Adjust width as needed
            height: 80,     // Adjust height as needed
            objectFit: 'contain', // Ensures the image fits within the container without cropping
          }}
        />
      </div>


      {
        LeftbarData.map(item => (
          <ListItem
            button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={location.pathname === item.path ? classes.active : classes.notActive}
          >
            <ListItemIcon>
              {React.cloneElement(item.icon, { className: classes.linkIcon })}
            </ListItemIcon>
            <ListItemText>{item.title}</ListItemText>
          </ListItem>
        ))
      }
    </div>
  );
}

export default LeftbarDesign;

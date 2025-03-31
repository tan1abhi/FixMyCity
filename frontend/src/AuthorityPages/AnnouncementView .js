import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, 
  IconButton, List, ListItem, ListItemAvatar, Avatar, ListItemText, 
  Typography, Tooltip } from '@mui/material';
import AnnouncementIcon from '@mui/icons-material/Campaign';
import CloseIcon from '@mui/icons-material/Close';

const AnnouncementView = ({ issue }) => {
  const [open, setOpen] = useState(false);

  const toggleDialog = () => {
    setOpen(!open);
  };

  // Function to generate random background color for user avatar
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ('00' + value.toString(16)).slice(-2);
    }
    return color;
  };

  return (
    <Box sx={{ margin: '1rem' }}>
      {/* Announcements Button */}
      <Tooltip title="View Announcements">
        <Button
          startIcon={<AnnouncementIcon />}
          variant="outlined"
          size="small"
          onClick={toggleDialog}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            padding: '6px 12px',
            fontSize: '0.8rem',
            backgroundColor: '#5a47ff',
            color: 'white',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              backgroundColor: '#6a5afa',
              color: '#fff',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Announcements
        </Button>
      </Tooltip>

      {/* Announcements Dialog */}
      <Dialog open={open} onClose={toggleDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Announcements</Typography>
          <IconButton onClick={toggleDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* Display Announcements */}
          {issue.announcements && issue.announcements.length > 0 ? (
            <List dense sx={{ padding: 0 }}>
              {issue.announcements.map((announcement, idx) => {
                const name = announcement.userName || 'User'; // Fallback if no userName exists
                return (
                  <ListItem key={idx} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: 0,
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f9f9f9',
                    },
                    '&:not(:last-child)': {
                      borderBottom: '1px solid #f0f0f0',
                    },
                  }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          backgroundColor: stringToColor(name),
                          color: '#fff',
                          width: 32,
                          height: 32,
                        }}
                      >
                        {name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={name}
                      secondary={
                        <>
                          <Typography variant="body2">{announcement.comment}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {announcement.timestamp ? new Date(announcement.timestamp).toLocaleString() : 'Invalid Date'}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No announcements yet.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AnnouncementView;

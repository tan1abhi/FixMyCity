import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, 
  IconButton, List, ListItem, ListItemAvatar, Avatar, ListItemText, 
  Typography, Tooltip } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import CloseIcon from '@mui/icons-material/Close';

const CommentView = ({ issue }) => {
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
      {/* Comment Button */}
      <Tooltip title="View Comments">
        <Button
          startIcon={<CommentIcon />}
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
          Comments
        </Button>
      </Tooltip>

      {/* Comments Dialog */}
      <Dialog open={open} onClose={toggleDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Comments</Typography>
          <IconButton onClick={toggleDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* Display Comments */}
          {issue.comments && issue.comments.length > 0 ? (
            <List dense sx={{ padding: 0 }}>
              {issue.comments.map((c, idx) => {
                const name = c.userName || 'User'; // Fallback if no userName exists
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
                          <Typography variant="body2">{c.text}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {c.timestamp ? new Date(c.timestamp).toLocaleString() : 'Invalid Date'}
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
              No comments yet.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CommentView;

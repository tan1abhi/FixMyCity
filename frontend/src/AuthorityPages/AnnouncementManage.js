import React from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, TextField,
  IconButton, List, ListItem, ListItemAvatar, Avatar,
  ListItemText, Typography, Tooltip
} from '@mui/material';
import AnnouncementIcon from '@mui/icons-material/Campaign';
import CloseIcon from '@mui/icons-material/Close';

// The component now expects announcement and setAnnouncement from parent
const AnnouncementManage = ({ 
  issue, 
  handleAnnouncement,
  announcement,  // State from parent
  setAnnouncement  // State setter from parent
}) => {
  const [open, setOpen] = React.useState(false);

  const toggleDialog = () => setOpen(!open);

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

  // Styles
  const styles = {
    dialogTitle: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
    },
    closeBtn: {
      color: 'rgba(0, 0, 0, 0.54)'
    },
    dialogContent: {
      padding: '16px 24px'
    },
    commentItem: {
      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      padding: '8px 0'
    },
    inputSection: {
      marginTop: '16px',
      display: 'flex',
      flexDirection: 'row', // Changed to row to align items horizontally
      gap: '8px',
      alignItems: 'center' // Align items vertically in the center
    },
    submitBtn: {
      backgroundColor: '#1976d2', // Blue color
      '&:hover': {
        backgroundColor: '#1565c0', // Darker blue on hover
      }
    },
    disabledBtn: {
      backgroundColor: '#cccccc', // Disabled button color
      color: '#666666',
    }
  };

  return (
    <>
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

      <Dialog open={open} onClose={toggleDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={styles.dialogTitle}>
          <Typography variant="h6">Announcements</Typography>
          <IconButton
            onClick={toggleDialog}
            sx={styles.closeBtn}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={styles.dialogContent}>
          {issue.announcements && issue.announcements.length > 0 ? (
            <List dense>
              {issue.announcements.map((a, idx) => {
                const name = a.userName || 'User';
                return (
                  <ListItem key={idx} sx={styles.commentItem}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          backgroundColor: stringToColor(name),
                          color: '#fff'
                        }}
                      >
                        {name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={name}
                      secondary={
                        <>
                          <Typography variant="body2">{a.comment}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {a.timestamp ? new Date(a.timestamp).toLocaleString() : 'Invalid Date'}
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

          {/* Only show input section if issue is not resolved */}
          {issue.status !== 'Resolved' && (
            <Box sx={styles.inputSection}>
              <TextField
                fullWidth
                label="Add an announcement"
                variant="outlined"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                size="small"
              />
              <Button
                onClick={() => handleAnnouncement(issue.id)}
                variant="contained"
                sx={styles.submitBtn}
                disabled={!announcement.trim()}
              >
                Announce
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnnouncementManage;

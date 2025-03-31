import React, { useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, TextField,
  IconButton, List, ListItem, ListItemAvatar, Avatar,
  ListItemText, Typography, Tooltip
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Mood';
import CloseIcon from '@mui/icons-material/Close';
import useStyles from './ViewIssuesStyles';

const FeedbackPopup = ({ issue, handleFeedback }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const toggleDialog = () => setOpen(!open);

  const handleSubmit = () => {
    handleFeedback(issue.id, feedbackText);
    setFeedbackText('');
  };

  // Generate color for Avatar background
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 60%)`;
    return color;
  };

  return (
    <>
      <Tooltip title="View Feedback">
        <Button
          startIcon={<FeedbackIcon />}
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
            transition: 'all 0.3s ease',    // Smooth transition for changes
          }}
        >
          Feedback
        </Button>
      </Tooltip>

      <Dialog open={open} onClose={toggleDialog} maxWidth="sm" fullWidth>
        <DialogTitle className={classes.dialogTitle}>
            Feedback
            <IconButton
                onClick={toggleDialog}
                className={classes.closeBtn}
                size="small"
            >
                <CloseIcon />
            </IconButton>
        </DialogTitle>

        <DialogContent className={classes.dialogContent}>
          {issue.feedback && issue.feedback.length > 0 ? (
            <List dense>
              {issue.feedback.map((f, idx) => (
                <ListItem key={idx} className={classes.commentItem}>
                  <ListItemAvatar>
                    <Avatar style={{ backgroundColor: stringToColor(f.userName), color: '#fff' }}>
                      {f.userName.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={f.userName}
                    secondary={
                      <>
                        <Typography variant="body2">{f.feedback}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(f.timestamp).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No feedback yet.
            </Typography>
          )}

          {/* Feedback Input (only if issue is resolved) */}
          {issue.status === 'Resolved' && (
            <Box className={classes.inputSection}>
              <TextField
                fullWidth
                label="Your Feedback"
                variant="outlined"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                size="small"
              />
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                className={classes.submitBtn}
                disabled={!feedbackText.trim()}
              >
                Submit
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeedbackPopup;

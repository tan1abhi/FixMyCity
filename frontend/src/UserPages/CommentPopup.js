import React, { useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, TextField,
  IconButton, List, ListItem, ListItemAvatar, Avatar,
  ListItemText, Typography, Tooltip
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import CloseIcon from '@mui/icons-material/Close';
import useStyles from './ViewIssuesStyles';

const CommentPopup = ({ issue, handleComment }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

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

  const handleSubmit = () => {
    handleComment(issue.id, commentText);
    setCommentText('');
  };

  return (
    <>
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

      <Dialog open={open} onClose={toggleDialog} maxWidth="sm" fullWidth>
        <DialogTitle className={classes.dialogTitle}>
          <Typography variant="h6">Comments</Typography>
          <IconButton
            onClick={toggleDialog}
            className={classes.closeBtn}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className={classes.dialogContent}>
          {issue.comments && issue.comments.length > 0 ? (
            <List dense>
              {issue.comments.map((c, idx) => {
                const name = c.userName || 'User';
                return (
                  <ListItem key={idx} className={classes.commentItem}>
                    <ListItemAvatar>
                      <Avatar
                        style={{
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

          {issue.status !== 'Resolved' ? (
            <Box className={classes.inputSection}>
              <TextField
                fullWidth
                label="Add a comment"
                variant="outlined"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                size="small"
              />
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                className={classes.submitBtn}
                disabled={!commentText.trim()}
              >
                Post
              </Button>
            </Box>
          ) : (
            <Typography color="error" variant="body2" mt={2}>
              Comments are disabled for resolved issues.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommentPopup;

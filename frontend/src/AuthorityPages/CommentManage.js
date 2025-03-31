import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, 
  IconButton, List, ListItem, ListItemAvatar, Avatar, ListItemText, 
  Typography, Tooltip, CircularProgress } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import CloseIcon from '@mui/icons-material/Close';

const CommentManage = ({ issue }) => {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

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

  // Fetch summarized comments from Flask API
  const fetchSummary = async () => {
    if (!issue.comments || issue.comments.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch("https://fixmycity-summarization.onrender.com/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comments: issue.comments.map(c => c.text), // Send only comment texts
        }),
      });

      const data = await response.json();
      setSummary(data.summary || "No summary available.");
    } catch (error) {
      console.error("Error fetching summary:", error);
      setSummary("Failed to generate summary.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchSummary(); // Fetch summary when dialog opens
  }, [open]);

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
          
        {/* Display Summarized Comments */}
        <Box sx={{
        backgroundColor: "#f5f5f5",
        padding: "0.75rem",
        borderRadius: "8px",
        marginBottom: "1rem",
        }}>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#333" }}>
            Summary
        </Typography>
        {loading ? (
            <CircularProgress size={20} sx={{ marginTop: "0.5rem" }} />
        ) : (
            <Typography variant="body2" color="textSecondary">{summary}</Typography>
        )}
        </Box>

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
                    '&:hover': { backgroundColor: '#f9f9f9' },
                    '&:not(:last-child)': { borderBottom: '1px solid #f0f0f0' },
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
            <Typography variant="body2" color="textSecondary">No comments yet.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CommentManage;

import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, 
  IconButton, List, ListItem, ListItemAvatar, Avatar,
  ListItemText, Typography, Tooltip, CircularProgress 
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CloseIcon from '@mui/icons-material/Close';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import FeedbackIcon from '@mui/icons-material/Mood';

const FeedbackManage = ({ 
  issue, 
  toggleFeedback, 
  showFeedback, 
  fetchSentiment, 
  loading, 
  sentiment,
  overallScore,
  positiveCount,
  negativeCount,
  neutralCount,
  positiveFeedback,
  negativeFeedback,
  neutralFeedback
}) => {
  const [openSentimentDialog, setOpenSentimentDialog] = useState(false);
  const [openSummaryDialog, setOpenSummaryDialog] = useState(false);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Unconditional useEffect for summary fetching
  useEffect(() => {
    const fetchSummary = async () => {
      if (!issue.feedback || issue.feedback.length === 0) {
        setSummary("No feedback available to summarize.");
        return;
      }

      setLoadingSummary(true);

      try {
        const response = await fetch("http://localhost:5001/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comments: issue.feedback.map((f) => f.feedback),
          }),
        });

        const data = await response.json();
        setSummary(data.summary);
      } catch (error) {
        setSummary("Error summarizing feedback.");
        console.error("Summarization Error:", error);
      }

      setLoadingSummary(false);
    };

    // Only fetch summary if feedback is shown for this specific issue
    if (showFeedback[issue.id]) {
      fetchSummary();
    }
  }, [showFeedback[issue.id], issue.id, issue.feedback]);

  // Only show for resolved issues
  if (issue.status !== "Resolved") {
    return null;
  }

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

  const handleFeedbackToggle = () => {
    toggleFeedback(issue.id);
  };

  return (
    <>
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        {/* Feedback Toggle Button */}
        <Tooltip title="View Feedback">
          <Button
            startIcon={<FeedbackIcon />}
            variant="outlined"
            size="small"
            onClick={handleFeedbackToggle}
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
            {showFeedback[issue.id] ? "Hide Feedback" : "View Feedback"}
          </Button>
        </Tooltip>

        {/* Analyze Sentiment Button */}
        <Tooltip title="Analyze Feedback Sentiment">
          <Button
            startIcon={<AnalyticsIcon />}
            variant="outlined"
            size="small"
            onClick={() => {
              fetchSentiment(issue.id); 
              setOpenSentimentDialog(true);
            }}
            disabled={loading}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              padding: '6px 12px',
              fontSize: '0.8rem',
              borderColor: '#0763a0',
              backgroundColor: '#0763a0',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: '#2392cf',
                color: '#fff',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
              },
              '&:focus': {
                outline: 'none',
                boxShadow: '0 0 5px rgba(23, 105, 158, 0.6)',
              },
              '&:disabled': {
                backgroundColor: '#cccccc',
                color: '#666666',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? "Analyzing..." : "Analyze Sentiment"}
          </Button>
        </Tooltip>
      </Box>

      {/* Feedback List Dialog */}
      <Dialog 
        open={showFeedback[issue.id] || false} 
        onClose={() => toggleFeedback(issue.id)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6">Feedback</Typography>
          <IconButton
            onClick={() => toggleFeedback(issue.id)}
            size="small"
            sx={{ color: '#666' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {/* Feedback Summary at the Top */}
        <Box
          sx={{
            backgroundColor: "#f5f5f5",
            padding: "0.75rem",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#333" }}
          >
            Summary
          </Typography>
          {loadingSummary ? (
            <CircularProgress size={20} sx={{ marginTop: "0.5rem" }} />
          ) : (
            <Typography variant="body2" color="textSecondary">
              {summary}
            </Typography>
          )}
        </Box>

        <DialogContent sx={{ padding: 2, maxHeight: '60vh', overflowY: 'auto' }}>
            {/* Feedback List */}
            {issue.feedback && issue.feedback.length > 0 ? (
                <List dense sx={{ padding: 0 }}>
                {issue.feedback.map((f, idx) => {
                    const name = f.userName || 'User'; // Fallback if no userName exists
                    return (
                    <ListItem
                        key={idx}
                        sx={{
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
                        }}
                    >
                        {/* Avatar */}
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

                        {/* Feedback Text */}
                        <ListItemText
                        primary={name}
                        secondary={
                            <>
                            <Typography variant="body2">{f.feedback}</Typography>
                            <Typography variant="caption" color="textSecondary">
                                {f.timestamp ? new Date(f.timestamp).toLocaleString() : 'Invalid Date'}
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
                No feedback available.
                </Typography>
            )}
        </DialogContent>
      </Dialog>

      {/* Sentiment Analysis Dialog */}
      <Dialog 
        open={openSentimentDialog} 
        onClose={() => setOpenSentimentDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6">Sentiment Analysis</Typography>
          <IconButton
            onClick={() => setOpenSentimentDialog(false)}
            size="small"
            sx={{ color: '#666' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: 2 }}>
          {sentiment && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              bgcolor: '#f9f9f9'
            }}>
              <Typography variant="h6" sx={{ 
                mb: 1, 
                color: '#333',
                borderBottom: '1px solid #ddd',
                pb: 1
              }}>
                Overall Sentiment: {sentiment}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                Sentiment Score: {overallScore.toFixed(2)}
              </Typography>
              
              {/* Feedback Counts */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                mb: 2,
                p: 1,
                bgcolor: '#f0f0f0',
                borderRadius: '4px'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'green' }}>
                  <ThumbUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography>Positive: {positiveCount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'red' }}>
                  <ThumbDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography>Negative: {negativeCount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'gray' }}>
                  <FeedbackIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography>Neutral: {neutralCount}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeedbackManage;
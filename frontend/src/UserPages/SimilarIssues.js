import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { handleError, handleSuccess } from '../Pages/utils';
import { 
  Box, Tab, Tabs, 
  Card, 
  Typography, 
  Button, 
  Chip, 
  IconButton, 
  Avatar, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Tooltip
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PeopleIcon from '@mui/icons-material/People';

import useStyles from './SimilarIssuesStyles.js';

const SimilarIssues = () => {
  const [similarIssues, setSimilarIssues] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showDetails, setShowDetails] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  
  // Helper function to generate consistent avatar colors
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const storedIssues = JSON.parse(localStorage.getItem("similarIssues")) || [];
  
        if (storedIssues.length === 0) {
          handleError("No similar issues found.");
          navigate("/report");
          return;
        }
  
        // Fetch the latest version of each issue from Firestore
        const updatedIssues = await Promise.all(
          storedIssues.map(async (issue) => {
            const issueRef = doc(db, "issues", issue.issueId);
            const issueSnap = await getDoc(issueRef);
  
            return issueSnap.exists()
              ? { ...issueSnap.data(), issueId: issueSnap.id }
              : issue;
          })
        );
  
        setSimilarIssues(updatedIssues);
      } catch (error) {
        console.error("Error fetching updated issues:", error);
        handleError("Failed to fetch the latest issues.");
      }
    };
  
    fetchIssues();
  }, [navigate]);
  

  const classes = useStyles();

  const handleUpvote = (issueId) => {
    console.log("🔍 Attempting to upvote issue with ID:", issueId);
    const userId = localStorage.getItem("userId");

    if (!userId) {
      handleError("You need to log in to vote.");
      return;
    }

    if (!issueId || typeof issueId !== "string") {
      handleError("Invalid issue ID");
      console.error("handleUpvote called with invalid issueId:", issueId);
      return;
    }

    setSimilarIssues(prev => 
      prev.map(issue => {
        if (issue.issueId === issueId) {
          let userVotes = { ...issue.userVotes };
          const previousVote = userVotes[userId] || null;

          if (previousVote === "upvote") {
            delete userVotes[userId];
          } else {
            userVotes[userId] = "upvote";
          }

          let upvotes = issue.upvotes || 0;
          let downvotes = issue.downvotes || 0;

          if (previousVote === "upvote") upvotes--;
          if (previousVote === "downvote") downvotes--;

          if (userVotes[userId] === "upvote" && previousVote !== "upvote") upvotes++;

          return { ...issue, upvotes, downvotes, userVotes, isUpdated: true };
        }
        return issue;
      })
    );

    setSuccessMessage("Upvoted successfully!");
  };


  const handleMerge = (issueId) => {
    const userId = localStorage.getItem("userId");
    const userIssue = JSON.parse(localStorage.getItem("userIssueDetails"));
    const userMedia = JSON.parse(localStorage.getItem("userMedia")) || [];
    const name = localStorage.getItem("loggedInUser") || "Anonymous";

    if (!userId || !userIssue) {
        handleError("Missing user or issue info.");
        return;
    }

    setSimilarIssues(prev => 
        prev.map(issue => {
            if (issue.issueId === issueId) {
                // Ensure description is an array
                const updatedDescription = Array.isArray(issue.description)
                    ? [...issue.description]
                    : [{ text: issue.description, name: "Unknown", date: new Date() }];
    
                updatedDescription.push({
                    text: userIssue.description,
                    name,
                    date: new Date(),
                });

                const mergedMedia = [...(issue.media || []), ...userMedia];

                // Mark issue as updated but do NOT update Firestore yet
                return { ...issue, description: updatedDescription, media: mergedMedia, isUpdated: true };
            }
            return issue;
        })
    );

    setSuccessMessage("Your report is ready to be merged. Click Save & Exit to finalize.");
  };



  const handleExit = async () => {
    try {
        const updates = similarIssues.filter(issue => issue.isUpdated);

        for (const issue of updates) {
            const issueRef = doc(db, "issues", issue.issueId);
            await updateDoc(issueRef, {
                description: issue.description,
                media: issue.media,
                upvotes: issue.upvotes,
                downvotes: issue.downvotes,
                userVotes: issue.userVotes
            });
        }

        setSuccessMessage("Changes saved successfully!");
        navigate("/");
    } catch (error) {
        console.error("Error saving changes:", error);
        handleError("Failed to save changes.");
    }
  };

  const [activeTabs, setActiveTabs] = useState({});

  const handleTabChange = (event, newValue, issueId) => {
      setActiveTabs(prevState => ({
          ...prevState,
          [issueId]: newValue,
      }));
  };    

  const toggleDescription = (issueId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [issueId]: !prev[issueId]
    }));
  };

  const handleMediaClick = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
  };

  const closeMediaModal = () => {
    setSelectedMedia(null);
  };



  return (
    <Box className="view-issues" 
        sx={{ 
        padding: 2, 
        marginTop: 0, // Only this is needed because Toolbar reserves space for the Topbar
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(180deg, #2c387e, #1769aa)',
        overflowX: 'hidden', 
    }}>
      <Typography
        variant="h4"
        sx={{
          color: 'white',
          textAlign: 'center',
          mb: 2,
          fontWeight: 600,
          pt: 2
        }}
      >
        Similar Issues Found
      </Typography>
      
      {successMessage && (
        <Box
          sx={{
            backgroundColor: 'rgba(46, 125, 50, 0.9)',
            color: 'white',
            p: 2,
            borderRadius: '4px',
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="body1">{successMessage}</Typography>
          <IconButton 
            size="small" 
            sx={{ color: 'white' }}
            onClick={() => setSuccessMessage("")}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      
      <Typography
        variant="subtitle1"
        sx={{
          color: 'white',
          textAlign: 'center',
          mb: 4
        }}
      >
        Check these similar issues before reporting a new one
      </Typography>

      {similarIssues.map((issue) => {
        const formattedDate = issue.dateOfComplaint
            ? (issue.dateOfComplaint.seconds
                ? new Date(issue.dateOfComplaint.seconds * 1000) // Convert Firestore timestamp
                : new Date(issue.dateOfComplaint) // If it's already a string or Date object
            ).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            : "Date not available";

        const reportCount = issue.description?.length || 0;
        const isExpanded = expandedDescriptions[issue.issueId] || false;
        const showDetailsForIssue = showDetails[issue.issueId] || false;

        return (
          <Card
            key={issue.id}
            className={classes.issueCard}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.64)", // Light transparent white
              backdropFilter: "blur(4px)", // Subtle glass effect
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              borderRadius: "12px",
              padding: "16px",
              transition: "0.3s ease-in-out",
              width: "70%", // Adjusting width to be wider
              maxWidth: "1200px", // Ensuring a reasonable max width
              marginBottom: '1rem',
            }}
          >
            
            {/* Title + Date + ID + Status */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "1rem",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Left Section: Title + ID + Date */}
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.8rem",
                    color: "rgb(29, 65, 95)",
                  }}
                >
                  {issue.title || issue.issueTitle}
                </Typography>

                <Typography sx={{ fontSize: "0.9rem", color: "#555" }}>
                  <strong>ID:</strong> {issue.issueId}
                </Typography>

                <Box display="flex" alignItems="center" sx={{ marginTop: "0.2rem" }}>
                  <CalendarTodayIcon color="primary" fontSize="small" sx={{ marginRight: 0.5 }} />
                  <Typography sx={{ fontSize: "0.9rem", color: "#555" }}>{formattedDate}</Typography>
                </Box>

                {/* ✅ Display the number of reports */}
                <Box display="flex" alignItems="center" sx={{ marginTop: "0.5rem" }}>
                  <PeopleIcon color="secondary" fontSize="small" sx={{ marginRight: 0.5 }} />
                  <Typography sx={{ fontSize: "0.9rem", color: "#555" }}>
                    <strong>{reportCount}</strong> {reportCount === 1 ? "person" : "people"} reported this issue
                  </Typography>
                </Box>
              </Box>

              {/* Right Section: Status Badge */}
              <Box>
                {issue.status === "Pending" && (
                  <Chip
                    icon={<PendingActionsIcon />}
                    label="Pending"
                    color="warning"
                    sx={{ fontSize: "0.9rem", padding: "0.5rem" }}
                  />
                )}
                {issue.status === "In-Progress" && (
                  <Chip
                    icon={<BuildCircleIcon />}
                    label="In-Progress"
                    color="info"
                    sx={{ fontSize: "0.9rem", padding: "0.5rem" }}
                  />
                )}
                {issue.status === "Resolved" && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Resolved"
                    color="success"
                    sx={{ fontSize: "0.9rem", padding: "0.5rem" }}
                  />
                )}
              </Box>
            </Box>


            {/* Vote Section + Merge */}
            <Box 
              className={classes.voteSection}
              sx={{ 
                marginTop: "1rem", 
                marginBottom: "1.5rem", 
                borderRadius: "8px", 
                backgroundColor: "transparent", 
                padding: "1rem", 
                display: "flex",  // ✅ Keep items in one line
                alignItems: "center",  // ✅ Align vertically
                justifyContent: "space-between", // ✅ Spread items evenly
                gap: "1rem",
                flexWrap: "wrap" // ✅ Wrap if needed on small screens
              }}
            >
              {/* Voting Buttons */}
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem", 
                }}
              >
                <Tooltip title="Upvote to prioritize">
                  <span>
                    <IconButton 
                      onClick={() => handleUpvote(issue.issueId)}
                      sx={{
                        color: issue.userVotes?.[localStorage.getItem("userId")] === "upvote" ? "#1976d2" : "#1976d2",
                        backgroundColor: issue.userVotes?.[localStorage.getItem("userId")] === "upvote"
                          ? "rgba(25, 118, 210, 0.4)" 
                          : "rgba(25, 118, 210, 0.1)", 
                        borderRadius: "50%", 
                        padding: "0.4rem", 
                        "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.2)" },
                      }}
                    >
                      <ArrowUpwardIcon />
                    </IconButton>
                  </span>
                </Tooltip>

                <Typography variant="body2" sx={{ fontSize: "1.2rem" }}>
                  {issue.upvotes || 0}
                </Typography>
              </Box>

              {/* Merge Button */}
              <Button
                variant="contained"
                startIcon={<LinkIcon />}
                size="small"
                onClick={() => handleMerge(issue.issueId)}
                sx={{
                  backgroundColor: '#3f73eb',
                  color: 'white',
                  padding: '8px 12px', // ✅ Slightly adjusted for better spacing
                  fontSize: '0.8rem',
                  borderColor: '#3f73eb',
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    backgroundColor: '#537fe6',
                    color: '#fff',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
                  },
                  '&:focus': {
                    outline: 'none',
                    boxShadow: '0 0 5px rgba(158, 23, 156, 0.6)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Merge My Report
              </Button>
            </Box>


            {/* Tabs */}
            <Tabs
                // value={activeTabs[issue.issueId] || null}
                // onChange={(event, newValue) => handleTabChange(event, newValue, issue.issueId)}
                // variant="scrollable"
                // scrollButtons="auto"
                // sx={{
                //     marginTop: "1rem",
                //     backgroundColor: "rgba(255, 255, 255, 0.8)",
                //     borderRadius: "8px",
                //     display: "flex",
                //     justifyContent: "center", // Centers the tab items
                //     "& .MuiTabs-flexContainer": {
                //         justifyContent: "center" // Ensures tabs are centered
                //     }
                // }}

                value={activeTabs[issue.id] || null}
                onChange={(event, newValue) => handleTabChange(event, newValue, issue.id)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile={true} // Ensures scroll buttons appear on mobile
                sx={{
                    marginTop: "1rem",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "center",
                    "& .MuiTabs-flexContainer": {
                        justifyContent: "center"
                    },
                    // Make scroll buttons more visible with higher contrast
                    "& .MuiTabs-scrollButtons": {
                        opacity: 1,
                        color: "rgba(0, 0, 0, 0.8)",
                        // Ensure buttons are always visible regardless of zoom level
                        visibility: "visible !important",
                        // Add a background to make them stand out
                        backgroundColor: "rgba(240, 240, 240, 0.6)",
                        borderRadius: "50%",
                        margin: "0 4px"
                    },
                    // Add a hover effect
                    "& .MuiTabs-scrollButtons:hover": {
                        backgroundColor: "rgba(220, 220, 220, 0.9)",
                    },
                    // Override the default behavior that hides buttons
                    "& .MuiTabs-scrollButtons.Mui-disabled": {
                        opacity: 0.3, // Still show disabled buttons but with reduced opacity
                    }
                }}
            >
                <Tab label="Address" value="address" />
                <Tab label="Media" value="media" />
                <Tab label="Description" value="description" />
            </Tabs>


            <Box sx={{ marginTop: "1rem" }}>

              {activeTabs[issue.issueId] === "address" && (
                <Box 
                  className={classes.addressRow}
                  sx={{ 
                    marginTop: '1.5rem', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
                    padding: '1rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between' 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <LocationOnIcon sx={{ color: 'red', fontSize: 32, mr: 1, flexShrink: 0 }} />
                    <Typography className={classes.address} sx={{ fontSize: '0.9rem' }}>
                      <strong>Address:</strong> {issue.address || 'Address not available'}
                    </Typography>
                  </Box>
                </Box>
              )}

              {activeTabs[issue.issueId] === "description" && (
                <Box
                  className={classes.descriptionSection}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginTop: "1rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <List dense disablePadding>
                    {Array.isArray(issue.description) &&
                      issue.description.map((descItem, i) => {
                        const name = descItem.name || "Anonymous";

                        // ✅ Robust date handling
                        const formattedDate = descItem.date
                          ? (descItem.date.seconds
                              ? new Date(descItem.date.seconds * 1000) // Firestore Timestamp
                              : new Date(descItem.date) // Regular Date/String
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Date not available"; // Fallback if date is missing

                        const isHidden = !isExpanded && i > 1;
                        if (isHidden) return null;

                        return (
                          <ListItem
                            key={i}
                            className={classes.descriptionItem}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              paddingY: "0.75rem",
                              borderBottom: i !== issue.description.length - 1 ? "1px solid #ddd" : "none",
                            }}
                          >
                            {/* Avatar */}
                            <ListItemIcon sx={{ minWidth: "40px" }}>
                              <Avatar
                                sx={{
                                  backgroundColor: stringToColor(name),
                                  color: "#fff",
                                  width: 32,
                                  height: 32,
                                  fontSize: "0.9rem",
                                }}
                              >
                                {name.charAt(0).toUpperCase()}
                              </Avatar>
                            </ListItemIcon>

                            {/* Description Content */}
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center">
                                  <Typography sx={{ fontWeight: 500, color: "#333", marginRight: "0.5rem" }}>
                                    {name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "#777" }}>
                                    {formattedDate}
                                  </Typography>
                                </Box>
                              }
                              secondary={descItem.text}
                              secondaryTypographyProps={{ sx: { fontSize: "0.85rem", color: "#555" } }}
                            />
                          </ListItem>
                        );
                      })}
                  </List>

                  {/* Toggle Button */}
                  {issue.description.length > 2 && (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => toggleDescription(issue.issueId)}
                      sx={{
                        display: "block",
                        margin: "0.5rem auto 0",
                        color: "#3f73eb",
                        fontSize: "0.75rem",
                        "&:hover": { color: "#658ce6" },
                      }}
                    >
                      {isExpanded ? "View Less" : "View More"}
                    </Button>
                  )}
                </Box>
              )}


              {activeTabs[issue.issueId] === "media" && issue.media && issue.media.length > 0 && (
                <Box
                  className={classes.mediaSection}
                  sx={{
                    marginTop: "1.5rem",
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    padding: "1rem",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <Box className={classes.mediaGallery}>
                    {issue.media.map((mediaItem, index) => {
                      if (!mediaItem?.url || !mediaItem?.type) return null;

                      return mediaItem.type.includes("image") ? (
                        <img
                          key={index}
                          src={mediaItem.url}
                          alt={`Media ${index + 1}`}
                          className={classes.mediaThumbnail}
                          onClick={() => handleMediaClick(mediaItem.url)}
                        />
                      ) : mediaItem.type.includes("video") ? (
                        <video key={index} controls className={classes.mediaThumbnail}>
                          <source src={mediaItem.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : null;
                    })}
                  </Box>
                </Box>
              )}

              {activeTabs[issue.issueId] === "media" && selectedMedia && (
                <Box
                  className={classes.mediaModal}
                  sx={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(0, 0, 0, 0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 9999, // Very high z-index to ensure it's on top
                      overflow: "hidden",
                      position: "fixed",
                      margin: 0,
                      padding: 0,
                      pointerEvents: "auto",
                  }}
                  onClick={closeMediaModal}
              >
                  <Box
                    className={classes.mediaModalContent}
                    sx={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100vw", // Full width
                      height: "100vh", // Full height
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton
                      className={classes.mediaModalCloseButton}
                      onClick={closeMediaModal}
                      sx={{
                        position: "absolute",
                        top: 20,
                        right: 20,
                        color: "white",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                        zIndex: 1400, // Ensure button is above media
                      }}
                      aria-label="Close"
                    >
                      <CloseIcon />
                    </IconButton>

                    {selectedMedia.match(/\.(mp4|webm|ogg)$/) ? (
                      <video controls className={classes.mediaModalVideo}>
                        <source src={selectedMedia} type="video/mp4" />
                      </video>
                    ) : (
                      <img
                        src={selectedMedia}
                        alt="Full Media"
                        className={classes.mediaModalImage}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain", // Ensures the entire media fits without cropping
                          borderRadius: "0px",
                      }}
                      />
                    )}
                  </Box>
                </Box>
              )}


            </Box>
 
          </Card>
        );
      })}

      {/* Fixed Exit Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<ExitToAppIcon />}
          onClick={handleExit}
          sx={{
            backgroundColor: '#ffa000',
            color: 'white',
            padding: '8px 8px',
            fontSize: '0.8rem',
            borderColor: '#3f73eb',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              backgroundColor: '#fcb030',
              color: '#fff',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
            }
          }}
        >
          Save & Exit
        </Button>
      </Box>
      
    </Box>
  );
};

export default SimilarIssues;
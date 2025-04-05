import React, { useState, useEffect, useRef, useCallback } from 'react';
import { handleError, handleSuccess } from '../Pages/utils';
import { doc, updateDoc, getDoc , collection, getDocs , onSnapshot, arrayUnion , arrayRemove } from "firebase/firestore";
import { db , firestore } from "../firebase/firebaseConfig";
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';
import { useMediaQuery, useTheme } from '@mui/material';
import { useLocation } from "react-router-dom";
import { State, City } from 'country-state-city';

import {
    Tabs, Tab,
    Card,
    Box,
    Button,
    Collapse,
    Grid,
    InputBase,
    Paper,
    Typography,
    IconButton,
    TextField,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Chip,
    List,
    ListItem,
    Avatar,
    Tooltip,
    ListItemIcon, 
    ListItemText,
    Dialog, 
    DialogTitle, 
    DialogContent,
    ListItemAvatar,
    Select,
    InputLabel,
    FormControl
  } from '@mui/material';

  import { Close, FilterList, Sort, Map as MapIcon, Search as SearchIcon } from '@mui/icons-material';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GavelIcon from '@mui/icons-material/Gavel';
import PeopleIcon from '@mui/icons-material/People';

import CommentManage from './CommentManage.js';
import AnnouncementManage  from './AnnouncementManage.js';
import FeedbackManage from './FeedbackManage.js';
import IssueStatus from './IssueStatus.js';


  import useStyles from './ManagingStyles.js';

  const libraries = ['places'];


const CurrentManaging = () => {
    const classes = useStyles();
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [issues, setIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [status, setStatus] = useState('');
    const [sortBy, setSortBy] = useState('mostRelevant');
    const [searchQuery, setSearchQuery] = useState('');
    const [showComments, setShowComments] = useState({});
    const [showAnnouncements, setShowAnnouncements] = useState({});
    const [announcement, setAnnouncement] = useState('');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [showFeedback, setShowFeedback] = useState({});
    const [sentiment, setSentiment] = useState(null);
    const [loading, setLoading] = useState(false);

    const [positiveFeedback, setPositiveFeedback] = useState([]);
    const [negativeFeedback, setNegativeFeedback] = useState([]);
    const [neutralFeedback, setNeutralFeedback] = useState([]);
    const [positiveCount, setPositiveCount] = useState(0);
    const [negativeCount, setNegativeCount] = useState(0);
    const [neutralCount, setNeutralCount] = useState(0);
    const [overallScore, setOverallScore] = useState(0);

    const name = localStorage.getItem('loggedInUser');
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);

    const [userState, setUserState] = useState('');
    const [userCity, setUserCity] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [cities, setCities] = useState([]);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const selectedCategory = queryParams.get("category");
    
    // Fetch user location and set initial filters
    useEffect(() => {
        const fetchUserLocation = async () => {
            try {
                if (!userId) return; // Ensure user is logged in
                const userRef = doc(db, "users", userId);
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const state = userData.state || '';
                    const city = userData.city || '';
                    
                    // Set user location state variables
                    setUserState(state);
                    setUserCity(city);
                    
                    // Set the initial filters to the user's state and city
                    setSelectedState(state);
                    setSelectedCity(city);
                    
                    // Now fetch issues with location filtering
                    fetchIssues(state, city);
                }
            } catch (error) {
                console.error("Error fetching user location:", error);
            }
        };
        
        fetchUserLocation();
    }, [userId]);

    // helper function to get state code
    const getStateCode = (stateName) => {
        const state = State.getStatesOfCountry("IN").find(
            state => state.name.toLowerCase() === stateName.toLowerCase()
        );
        return state ? state.isoCode : null;
    };

    // city fetch based on selected state
    useEffect(() => {
        let currentStateName = selectedState || userState;
        let currentStateCode = getStateCode(currentStateName);
        
        if (currentStateCode) {
            try {
                const stateCities = City.getCitiesOfState("IN", currentStateCode);
                
                // Ensure stateCities is an array before setting
                if (Array.isArray(stateCities) && stateCities.length > 0) {
                    setCities(stateCities);
                } else {
                    console.warn("No cities found for state:", currentStateName);
                    setCities([]);
                }
            } catch (error) {
                console.error("Error fetching cities:", error);
                setCities([]);
            }
        } else {
            console.warn("No valid state code found for:", currentStateName);
            setCities([]);
        }
    }, [selectedState, userState]);

    // for fetching the department
    useEffect(() => {
        const fetchAuthorities = async () => {
            if (!filteredIssues || filteredIssues.length === 0) return;

            const updatedIssues = await Promise.all(
                filteredIssues.map(async (issue) => {
                    if (!issue.managingAuthorities) return issue;

                    const updatedAuthorities = await Promise.all(
                        issue.managingAuthorities.map(async (authority) => {
                            try {
                                const userRef = doc(db, "users", authority.Id);
                                const userSnap = await getDoc(userRef);

                                return userSnap.exists()
                                    ? { ...authority, department: userSnap.data().department || "Unknown" }
                                    : { ...authority, department: "Unknown" };
                            } catch (error) {
                                console.error("Error fetching department:", error);
                                return { ...authority, department: "Error loading department" };
                            }
                        })
                    );

                    return { ...issue, managingAuthorities: updatedAuthorities };
                })
            );

            setFilteredIssues((prevIssues) => {
                const isEqual = JSON.stringify(prevIssues) === JSON.stringify(updatedIssues);
                return isEqual ? prevIssues : updatedIssues;
            });
        };

        fetchAuthorities();
    }, [filteredIssues]);

    // Real-time updates from Firestore with proper state and city filtering
    useEffect(() => {
        if (!userState) return; // Wait until we have user state
        
        const unsubscribe = onSnapshot(collection(db, "issues"), (snapshot) => {
            const updatedIssues = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            
            // Filter issues by user's authority, category, state, and city
            const managedIssues = updatedIssues.filter(issue => 
                Array.isArray(issue.managingAuthorities) &&
                issue.managingAuthorities.some(authority => authority.Id === userId) &&
                (selectedCategory ? issue.category === selectedCategory : true) &&
                (!selectedState || issue.state === selectedState) && // State filtering
                (!selectedCity || issue.city === selectedCity) // City filtering
            );
            
            setIssues(managedIssues);
            setFilteredIssues(managedIssues);
        });
        
        return () => unsubscribe();
    }, [userId, selectedCategory, selectedState, selectedCity, userState]);

    // Fetch all issues from the backend with location filtering
    const fetchIssues = async (state = selectedState, city = selectedCity) => {
        try {
            if (!userId) {
                console.error("User ID not found in localStorage.");
                return;
            }
            
            const issuesCollection = collection(db, "issues");
            const querySnapshot = await getDocs(issuesCollection);
            const allIssues = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Filter issues by user's authority, category, state, and city
            const managedIssues = allIssues.filter(issue => 
                Array.isArray(issue.managingAuthorities) &&
                issue.managingAuthorities.some(authority => authority.Id === userId) &&
                (selectedCategory ? issue.category === selectedCategory : true) &&
                (!state || issue.state === state) && // State filtering
                (!city || issue.city === city) // City filtering
            );
            
            setIssues(managedIssues);
            setFilteredIssues(managedIssues);
        } catch (error) {
            console.error("Error fetching issues:", error);
        }
    };

    // Function to apply filters and sorting
    const applyFiltersAndSort = () => {
        let filtered = [...issues];
        
        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(issue => issue.category === selectedCategory);
        }
        
        // Apply state filter
        if (selectedState) {
            filtered = filtered.filter(issue => issue.state === selectedState);
        }
        
        // Apply city filter
        if (selectedCity) {
            filtered = filtered.filter(issue => issue.city === selectedCity);
        }
        
        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(issue => {
                const combinedDescription = Array.isArray(issue.description)
                    ? issue.description.map(desc => desc.text).join(" ") // Merge all descriptions
                    : issue.description || ""; // Fallback if not an array
                
                return (
                    issue.issueTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    combinedDescription.toLowerCase().includes(searchQuery.toLowerCase())
                );
            });
        }
        
        // Filter by status
        if (status) {
            filtered = filtered.filter(issue => issue.status === status);
        }
        
        // Sort issues
        if (sortBy === 'mostRelevant') {
            filtered.sort((a, b) => b.upvotes - a.upvotes);
        } else if (sortBy === 'mostRecent') {
            filtered.sort((a, b) => new Date(b.dateOfComplaint) - new Date(a.dateOfComplaint));
        }
        
        setFilteredIssues(filtered);
    };

    // Automatically apply filters when any filter changes
    useEffect(() => {
        applyFiltersAndSort();
    }, [issues, selectedState, selectedCity, status, sortBy, searchQuery, selectedCategory]);

    // Search box to search Issues by Title and description
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        
        // Apply filters will be triggered by the useEffect above
    };

    // Handle state selection change
    const handleStateChange = (e) => {
        const newState = e.target.value;
        setSelectedState(newState);
        // Reset city when state changes
        setSelectedCity('');
    };

    // Handle city selection change
    const handleCityChange = (e) => {
        setSelectedCity(e.target.value);
    };

    // Analyse sentiment of the feedbacks
    const fetchSentiment = async (issueId) => {
        setLoading(true);
    
        try {
            const response = await axios.get(`https://fixmycity-sentimentanalysis.onrender.com/analyze-sentiment/${issueId}`);
            console.log('Sentiment API Response:', response.data);
    
            if (response.data) {
                // Update state with the new sentiment data
                setSentiment(response.data.overall_sentiment);
                setOverallScore(response.data.overall_score);
    
                // Update categorized feedback counts
                setPositiveCount(response.data.positive_count);
                setNegativeCount(response.data.negative_count);
                setNeutralCount(response.data.neutral_count);
    
                // Store categorized feedback for display
                setPositiveFeedback(response.data.positive_feedback);
                setNegativeFeedback(response.data.negative_feedback);
                setNeutralFeedback(response.data.neutral_feedback);
            } else {
                setSentiment("No sentiment data found.");
            }
        } catch (error) {
            console.error("Error analyzing sentiment:", error);
            setSentiment("Error analyzing sentiment.");
        } finally {
            setLoading(false);
        }
    };

    // Function to handle media click
    const handleMediaClick = (mediaUrl) => {
        setSelectedMedia(mediaUrl);
    };

    // Function to close the modal
    const closeMediaModal = () => {
        setSelectedMedia(null);
    };

    // Change the status of an Issue
    const handleStatusChange = async (issueId, newStatus) => {
        try {
            console.log(`Updating status for issue ${issueId} to ${newStatus}...`);
    
            const issueRef = doc(firestore, "issues", issueId);
    
            await updateDoc(issueRef, { status: newStatus });
    
            console.log("Status updated successfully");
    
            // Show success message
            handleSuccess("Status updated successfully");
    
            // Update local state to reflect change
            setIssues((prevIssues) =>
                prevIssues.map((issue) =>
                    issue.id === issueId ? { ...issue, status: newStatus } : issue
                )
            );
        } catch (error) {
            console.error("Error updating status:", error);
            handleError("Failed to update status");
        }
    };

    // "Manage" a Issue
    const handleManageAuthority = async (issueId) => {
        const name = localStorage.getItem("loggedInUser"); // Authority name
        const userId = localStorage.getItem("userId"); // Authority ID
    
        try {
            console.log(`Adding authority (${name}, ${userId}) to issue ${issueId}...`);
    
            const issueRef = doc(firestore, "issues", issueId);
    
            // Update Firestore to add the authority
            await updateDoc(issueRef, {
                managingAuthorities: arrayUnion({ Authority: name, Id: userId })
            });
    
            console.log("Authority added successfully");
    
            // Handle success message
            handleSuccess("Authority added successfully");
    
            // Re-fetch issues to reflect the update
            fetchIssues(selectedState, selectedCity);
        } catch (error) {
            console.error("Error managing authority:", error);
            handleError("An error occurred while managing the authority.");
        }
    };
    
    // "Unmanage" a Issue
    const handleUnmanageAuthority = async (issueId) => {
        const userId = localStorage.getItem('userId'); // Authority ID
    
        try {
            const issueRef = doc(firestore, "issues", issueId); // Reference to the issue document
            const issueSnap = await getDoc(issueRef);
    
            if (issueSnap.exists()) {
                const issueData = issueSnap.data();
                const updatedAuthorities = issueData.managingAuthorities.filter(authority => authority.Id !== userId);
    
                await updateDoc(issueRef, { managingAuthorities: updatedAuthorities });
    
                handleSuccess("Authority removed successfully.");
                fetchIssues(selectedState, selectedCity); // Re-fetch issues to reflect the update
            } else {
                handleError("Issue not found.");
            }
        } catch (error) {
            console.error("Error unmanaging authority:", error);
            handleError("An error occurred while unmanaging the authority.");
        }
    };
    
    // Handle adding an announcement
    const handleAnnouncement = async (issueId) => {
        try {
            const userName = localStorage.getItem("loggedInUser"); // Get user name
            const announcementText = announcement.trim(); // Ensure announcement isn't empty

            if (!userName || !announcementText) {
                handleError("Please enter an announcement.");
                return;
            }

            console.log(`Adding announcement for issue ${issueId}: "${announcementText}"`);

            const issueRef = doc(firestore, "issues", issueId);

            // Fetch existing issue data to check if it exists
            const issueSnapshot = await getDoc(issueRef);
            if (!issueSnapshot.exists()) {
                throw new Error("Issue not found.");
            }

            // Add the new announcement to Firestore
            await updateDoc(issueRef, {
                announcements: arrayUnion({
                    userName,
                    comment: announcementText,
                    timestamp: new Date().toISOString() // Store timestamp
                })
            });

            console.log("Announcement added successfully!");
            handleSuccess("Announcement added successfully!");
            
            // Remove this local state update since Firestore listener will handle it
            // setIssues((prevIssues) => ...)
            
            setAnnouncement(""); // Clear the input field
        } catch (error) {
            console.error("Error adding announcement:", error);
            handleError("An unexpected error occurred. Please try again.");
        }
    };

    // Toggle comment visibility for a specific issue
    const toggleComments = (issueId) => {
        setShowComments((prev) => ({
            ...prev,
            [issueId]: !prev[issueId],
        }));
    };

    // Toggle announcements visibility for a specific issue
    const toggleAnnouncements = (issueId) => {
        setShowAnnouncements((prev) => ({
            ...prev,
            [issueId]: !prev[issueId],
        }));
    };
    
    // Toggle feedback visibility for a specific issue
    const toggleFeedback = (issueId) => {
        setShowFeedback((prev) => ({
            ...prev,
            [issueId]: !prev[issueId],
        }));
    };

    // Map
    // Handle map load and set initial position
    const onMapLoad = useCallback((mapInstance) => {
        console.log("Map loaded:", mapInstance);
        setMap(mapInstance);
    }, []);

    // Handle map unmount
    const onMapUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Update the map with location
    const updateMapWithLocation = (location) => {
        if (!map || !location?.lat || !location?.lng) return;
    
        const latLng = new window.google.maps.LatLng(location.lat, location.lng);

        console.log("Updating map with location:", location);
        console.log("Map instance:", map);
    
        if (marker) {
            marker.setMap(null);
        }
    
        const newMarker = new window.google.maps.Marker({
            position: latLng,
            map,
            title: 'Issue Location',
            draggable: true,
        });
    
        setMarker(newMarker);
    
        map.panTo(latLng);
        map.setZoom(16);
    };
    
    // Handle view location on map button click
    const handleViewOnMap = (location) => {
        console.log("Button clicked. Location:", location);
        setSelectedLocation(location);
    };
    
    useEffect(() => {
        if (map && selectedLocation) {
            updateMapWithLocation(selectedLocation);
        }
    }, [map, selectedLocation]);

    const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi

    // UI States
    const [showFilters, setShowFilters] = useState(false);
    const [showSortOptions, setShowSortOptions] = useState(false);
    const [showMap, setShowMap] = useState(false);    
    const topSectionRef = useRef(null);
    const [topSectionHeight, setTopSectionHeight] = useState(0);
    const [showAllDescriptions, setShowAllDescriptions] = useState(false);
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [showDetails, setShowDetails] = useState(false);
    const [expandedIssueIds, setExpandedIssueIds] = useState(new Set());
    
    const toggleIssueDetails = (issueId) => {
        setExpandedIssueIds(prev => {
            const updated = new Set(prev);
            if (updated.has(issueId)) {
                updated.delete(issueId); // collapse
            } else {
                updated.add(issueId); // expand
            }
            return updated;
        });
    };

    useEffect(() => {
        const node = topSectionRef.current;
        if (!node) return;

        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry?.contentRect?.height) {
                setTopSectionHeight(entry.contentRect.height);
            }
        });

        resizeObserver.observe(node);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const stringToColor = (name) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = `hsl(${hash % 360}, 70%, 70%)`;
        return color;
    };
    
    const toggleDescription = (issueId) => {
        setExpandedDescriptions((prev) => ({
            ...prev,
            [issueId]: !prev[issueId],
        }));
    };

    const [activeTabs, setActiveTabs] = useState({});
    
    const handleTabChange = (event, newValue, issueId) => {
        setActiveTabs(prevState => ({
            ...prevState,
            [issueId]: newValue,
        }));
    };    

    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('sm')); 
    const drawerWidth = 200; // Sidebar width
    

    return (
        <Box
            className="view-issues"
            sx={{
                padding: 2,
                margin: 0, 
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #2c387e, #1769aa)', 
                overflowX: 'hidden',
            }}
        >
            

            {/* Top Section — Search + Filters + Map */}
            <Box
                ref={topSectionRef}
                className={classes.topSection}
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: isDesktop ? drawerWidth : 0, // Shift when sidebar is visible
                    width: isDesktop ? `calc(100% - ${drawerWidth}px)` : '100%', // Adjust width responsively
                    zIndex: 1000,
                    backgroundColor: 'rgb(4, 33, 77)',
                    padding: '10px 20px',
                    borderBottom: 'none',
                    transition: 'left 0.3s ease-in-out, width 0.3s ease-in-out', // Smooth transition
                }}
            >
                {/* Search Bar */}
                <Paper
                    component="form"
                    className={classes.searchBar}
                    sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.45)', // Light grey background
                        boxShadow: 'none', // Optional: remove shadow for a flat look
                        borderRadius: '8px', // Optional: rounded corners
                        padding: '4px 8px', // Spacing inside the search box
                    }}
                >
                    <SearchIcon sx={{ marginRight: 1, color: 'gray' }} />
                    <InputBase
                        placeholder="Search by title or description..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className={classes.input}
                        inputProps={{ sx: { color: 'gray' } }} // Makes text inside input grey
                    />
                </Paper>



                {/* Control Buttons */}
                <Box className={classes.actionButtons}>
                    <Button
                        variant="contained"
                        startIcon={<FilterList />}
                        onClick={() => setShowFilters((prev) => !prev)}
                        sx={{
                            backgroundColor: '#ffa000',
                            color: '#04214d',
                            fontWeight: 'bold',
                            '&:hover': {
                                fontWeight: 'bold',
                                backgroundColor: '#fcb030',
                            },
                        }}
                    >
                        Filters
                    </Button>
                    
                    <Button
                        variant="contained"
                        startIcon={<Sort />}
                        onClick={() => setShowSortOptions((prev) => !prev)}
                        sx={{
                            backgroundColor: '#ffa000',
                            color: '#04214d',
                            fontWeight: 'bold',
                            '&:hover': {
                                fontWeight: 'bold',
                                backgroundColor: '#fcb030',
                            },
                        }}
                    >
                        Sort
                    </Button>
                    
                    <Button
                        variant="outlined"
                        startIcon={<MapIcon />}
                        onClick={() => setShowMap((prev) => !prev)}
                        sx={{
                            fontWeight: 'bold',
                            color: '#ffa000', 
                            borderColor: '#ffb300', 
                            '&:hover': {
                                fontWeight: 'bold',
                                backgroundColor: 'rgba(255, 179, 0, 0.1)',
                            },
                        }}
                    >
                        {showMap ? 'Hide Map' : 'Map'}
                    </Button>
                </Box>


                {/* Filters Panel */}
                <Collapse in={showFilters}>
                    <Box className={classes.sectionBox} sx={{backgroundColor:'rgb(249, 199, 114)'}}>
                        <Box className={classes.sectionHeader}>
                        <IconButton onClick={() => setShowFilters(false)}>
                            <Close />
                        </IconButton>
                        </Box>
                        <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="City"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                disabled={!selectedState && !userState}
                                className={classes.selectControl}
                                >
                                <MenuItem value="">All Cities</MenuItem>
                                {cities.map((city) => (
                                    <MenuItem key={`${city.name}-${city.stateCode}`} value={city.name}>
                                        {city.name}
                                    </MenuItem>
                                ))}
                                </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4} md={3}>
                            <TextField
                            select
                            fullWidth
                            label="Status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className={classes.selectControl}
                            >
                            <MenuItem value="">All Statuses</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="In-Progress">In-Progress</MenuItem>
                            <MenuItem value="Resolved">Resolved</MenuItem>
                            </TextField>
                        </Grid>
                        </Grid>
                    </Box>
                </Collapse>


                {/* Sort Panel */}
                <Collapse in={showSortOptions}>
                    <Box className={classes.sectionBox} sx={{backgroundColor:'rgb(249, 199, 114)'}}>
                        <Box className={classes.sectionHeader}>
                        <IconButton onClick={() => setShowSortOptions(false)}>
                            <Close />
                        </IconButton>
                        </Box>
                        <TextField
                        select
                        fullWidth
                        label="Sort By"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={classes.selectControl}
                        >
                        <MenuItem value="mostRelevant">Most Relevant</MenuItem>
                        <MenuItem value="mostRecent">Most Recent</MenuItem>
                        </TextField>
                    </Box>
                </Collapse>


                {/* Map Section */}
                <Collapse in={showMap} mountOnEnter unmountOnExit>
                    <Box className={classes.mapContainer}>
                        {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={
                            selectedLocation?.lat && selectedLocation?.lng
                                ? selectedLocation
                                : defaultCenter
                            }
                            zoom={selectedLocation ? 16 : 10}
                            onLoad={onMapLoad}
                            onUnmount={onMapUnmount}
                        />
                        ) : (
                        <Typography>Loading map...</Typography>
                        )}
                    </Box>
                </Collapse>
            </Box>



            {/* Issues List */}
            <Box
                sx={{
                marginTop: `${topSectionHeight + 20}px`, // Adjust dynamically based on top section height
                overflowY: 'auto',
                }}
            >
                {Array.isArray(filteredIssues) && filteredIssues.map((issue) => {

                const formattedDate = issue.dateOfComplaint 
                ? (issue.dateOfComplaint.toDate ? issue.dateOfComplaint.toDate() : new Date(issue.dateOfComplaint))
                : null;

                const isDetailsVisible = expandedIssueIds.has(issue.id);
                const reportCount = issue.description?.length || 0;
                const isExpanded = expandedDescriptions[issue.id] || false;

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

                        {/* Title + Issue ID + Date */}
                        <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: "1rem",
                            paddingBottom: "0.5rem",
                            borderBottom: "1px solid rgba(0, 0, 0, 0.1)", 
                        }}>
                            {/* Left Section: Title + ID + Date */}
                            <Box sx={{ display: "flex", flexDirection: "column" }}>
                                <Typography 
                                    sx={{
                                        fontWeight: 600,  
                                        fontSize: '1.8rem', 
                                        color: 'rgb(29, 65, 95)',
                                    }}
                                >
                                    {issue.issueTitle}
                                </Typography>
                                <Typography sx={{ fontSize: '0.9rem', color: '#555' }}>
                                    <strong>ID:</strong> {issue.id}
                                </Typography>
                                <Box display="flex" alignItems="center" sx={{ marginTop: "0.2rem" }}>
                                    <CalendarTodayIcon color="primary" fontSize="small" sx={{ marginRight: 0.5 }} />
                                    <Typography sx={{ fontSize: "0.9rem", color: "#555" }}>
                                        {formattedDate
                                            ? formattedDate.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })
                                            : 'Invalid Date'}
                                    </Typography>
                                </Box>

                                {/* ✅ Display number of people who reported */}
                                <Box display="flex" alignItems="center" sx={{ marginTop: "0.5rem" }}>
                                    <PeopleIcon color="secondary" fontSize="small" sx={{ marginRight: 0.5 }} />
                                    <Typography sx={{ fontSize: "0.9rem", color: "#555" }}>
                                        <strong>{reportCount}</strong> {reportCount === 1 ? "person" : "people"} reported this issue
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Right Section: Status Badge */}
                            <IssueStatus issue={issue} handleStatusChange={handleStatusChange} />
                        </Box>

                        {/* Vote Section */}
                        <Box 
                            sx={{ 
                                marginTop: "1rem", 
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",  // Centering content
                                gap: "1.5rem",
                                backgroundColor: "transparent",
                                flexWrap: "wrap" // Ensures responsiveness
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <Tooltip title="Upvotes">
                                <span>
                                    <IconButton
                                        disabled={issue.status === 'Resolved'}
                                        sx={{
                                            color: issue.status === 'Resolved' ? '#999' : '#1976d2', 
                                            backgroundColor: issue.status === 'Resolved' ? 'transparent' : 'rgba(25, 118, 210, 0.1)', 
                                            borderRadius: '50%', 
                                            padding: '0.5rem', 
                                            '&:hover': {
                                                backgroundColor: issue.status === 'Resolved' ? 'transparent' : 'rgba(25, 118, 210, 0.2)',
                                            },
                                            pointerEvents: issue.status === 'Resolved' ? 'none' : 'auto',
                                        }}
                                    >
                                        <ArrowUpwardIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <Typography variant="body2" className={classes.voteCount} sx={{fontSize: '1.3rem', marginRight: '3rem'}}>
                                {issue.upvotes}
                            </Typography>

                            <Tooltip title="Downvote">
                                <span>
                                    <IconButton
                                        disabled={issue.status === 'Resolved'}
                                        sx={{
                                            color: issue.status === 'Resolved' ? '#999' : '#d32f2f', 
                                            backgroundColor: issue.status === 'Resolved' ? 'transparent' : 'rgba(211, 47, 47, 0.1)', 
                                            borderRadius: '50%', 
                                            padding: '0.5rem', 
                                            '&:hover': {
                                                backgroundColor: issue.status === 'Resolved' ? 'transparent' : 'rgba(211, 47, 47, 0.2)',
                                            },
                                            pointerEvents: issue.status === 'Resolved' ? 'none' : 'auto',
                                        }}
                                    >
                                        <ArrowDownwardIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <Typography variant="body2" className={classes.voteCount} sx={{fontSize: '1.3rem'}}>
                                {issue.downvotes}
                            </Typography>
                        </Box>
                        </Box>

                        
                        {/* Tabs */}
                        <Tabs
                            value={activeTabs[issue.id] || null}
                            onChange={(event, newValue) => handleTabChange(event, newValue, issue.id)}
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile={true}
                            TabScrollButtonProps={{
                                // This ensures scroll buttons work correctly by forcing them to be visible
                                disableRipple: false,
                                sx: {
                                    '&.Mui-disabled': {
                                        opacity: 0.3,
                                    }
                                }
                            }}
                            sx={{
                                marginTop: "1rem",
                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                borderRadius: "8px",
                                display: "flex",
                                justifyContent: "center",
                                "& .MuiTabs-flexContainer": {
                                    justifyContent: "flex-start" // Changed from center to flex-start
                                },
                                // Make scroll buttons more visible with higher contrast
                                "& .MuiTabs-scrollButtons": {
                                    opacity: 1,
                                    color: "rgba(0, 0, 0, 0.8)",
                                    // Use !important less aggressively
                                    visibility: "visible",
                                    // Add a background to make them stand out
                                    backgroundColor: "rgba(240, 240, 240, 0.6)",
                                    borderRadius: "50%",
                                    margin: "0 4px",
                                    zIndex: 2 // Ensure buttons appear above the tabs
                                },
                                // Add a hover effect
                                "& .MuiTabs-scrollButtons:hover": {
                                    backgroundColor: "rgba(220, 220, 220, 0.9)",
                                },
                                // Override the default behavior that hides buttons but less aggressively
                                "& .MuiTabs-scrollButtons.Mui-disabled": {
                                    opacity: 0.3,
                                }
                            }}
                        >
                            <Tab label="Address" value="address" />
                            <Tab label="Media" value="media" />
                            <Tab label="Description" value="description" />
                            <Tab label="Authorities" value="authorities" />
                            <Tab label="Comments" value="comments" />
                            <Tab label="Announcements" value="announcements" />
                            {issue.status === "Resolved" && issue.feedback && (
                                <Tab label="Feedback" value="feedback" />
                            )}
                        </Tabs>

                        
                        <Box sx={{ marginTop: "1rem" }}>
                        
                            {activeTabs[issue.id] === "address" && (
                                <Box
                                className={classes.addressRow}
                                sx={{
                                    marginTop: "1.5rem",
                                    borderRadius: "8px",
                                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                                    padding: "1rem",
                                }}
                                >
                                <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                                    <LocationOnIcon sx={{ color: "red", fontSize: 32, mr: 1, flexShrink: 0 }} />
                                    <Typography className={classes.address} sx={{ fontSize: "1rem" }}>
                                    <strong>Address:</strong> {issue.address || "Address not available"}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    className={classes.viewOnMapButton}
                                    onClick={() => {
                                    handleViewOnMap({ lat: issue.lat, lng: issue.lng });
                                    setShowMap(true);
                                    }}
                                    sx={{
                                    padding: "8px 8px",
                                    backgroundColor: "#529900",
                                    "&:hover": {
                                        backgroundColor: "darkgreen",
                                    },
                                    fontSize: "0.8rem",
                                    }}
                                >
                                    View on Map
                                </Button>
                                </Box>
                            )}

                            {activeTabs[issue.id] === "description" && (
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

                                        // Properly handle Firestore timestamp or standard date
                                        const date = descItem.date?.seconds
                                            ? new Date(descItem.date.seconds * 1000) // Convert Firestore timestamp
                                            : new Date(descItem.date); // Regular Date

                                        const formattedDate = date.toLocaleDateString(undefined, {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        });

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
                                                borderBottom:
                                                i !== issue.description.length - 1 ? "1px solid #ddd" : "none",
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
                                        onClick={() => toggleDescription(issue.id)}
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


                            {activeTabs[issue.id] === "media" && issue.media && issue.media.length > 0 && (
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

                            {/* Media Modal */}
                            {activeTabs[issue.id] === "media" && selectedMedia && (
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
                                onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
                                >
                                {/* Close Button */}
                                <IconButton
                                    className={classes.mediaModalCloseButton}
                                    onClick={closeMediaModal}
                                    aria-label="Close"
                                    sx={{
                                    position: "absolute",
                                    top: 20,
                                    right: 20,
                                    color: "white",
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                                    zIndex: 1400, // Ensure button is above media
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>

                                {/* Enlarged Media */}
                                {selectedMedia.match(/\.(mp4|webm|ogg)$/) ? (
                                    <video controls className={classes.mediaModalVideo} style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "0px" }}>
                                    <source src={selectedMedia} type="video/mp4" />
                                    Your browser does not support the video tag.
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

                            {activeTabs[issue.id] === "authorities" &&
                            issue.managingAuthorities && 
                            issue.managingAuthorities.length > 0 && (
                                <Box
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        marginTop: '1rem',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        marginBottom: '1.5rem',
                                    }}
                                >

                                    <List dense disablePadding className={classes.authorityList}>
                                        {issue.managingAuthorities.map((authority, index) => (
                                            <ListItem
                                                key={index}
                                                className={classes.authorityItem}
                                                sx={{
                                                    borderBottom: index !== issue.managingAuthorities.length - 1 ? '1px solid #ddd' : 'none',
                                                    paddingY: '0.5rem',
                                                }}
                                            >
                                                <ListItemIcon className={classes.authorityIcon}>
                                                    <AccountBalanceIcon fontSize="small" sx={{ color: '#6e26b5' }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={authority.Authority}
                                                    secondary={authority.department ? `Department: ${authority.department}` : "Loading..."}
                                                    primaryTypographyProps={{ sx: { fontWeight: 500, color: '#333' } }}
                                                    secondaryTypographyProps={{ sx: { fontSize: '0.85rem', color: '#666' } }}
                                                    className={classes.authorityText}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>

                                    {/* Manage/Unmanage Button */}
                                    <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => {
                                        if (
                                            issue.managingAuthorities.some(
                                                authority => authority.Id === localStorage.getItem('userId')
                                            )
                                        ) {
                                            handleUnmanageAuthority(issue.id);
                                        } else {
                                            handleManageAuthority(issue.id);
                                        }
                                    }}
                                    sx={{
                                        marginTop: '1rem',
                                        backgroundColor: '#079dfa',
                                        color: '#fff',
                                        fontWeight: 500,
                                        fontSize: '0.8rem',
                                        padding: '8px 8px',
                                        display: 'block',
                                        mx: 'auto', // center horizontally
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: '#44aff2',
                                        },
                                    pointerEvents: issue.status === 'Resolved' ? 'none' : 'auto',
                                    opacity: issue.status === 'Resolved' ? 0.6 : 1,
                                }}
                                disabled={issue.status === 'Resolved'}
                            >
                                {issue.managingAuthorities.some(
                                    authority => authority.Id === localStorage.getItem('userId')
                                )
                                    ? 'UNMANAGE'
                                    : 'MANAGE'}
                            </Button>

                                </Box>
                            )}



                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "1rem" }}>
                                {activeTabs[issue.id] === "comments" && (
                                    <CommentManage issue={issue} />
                                )}

                                {activeTabs[issue.id] === "announcements" && (
                                    <AnnouncementManage
                                        issue={issue}
                                        handleAnnouncement={handleAnnouncement}
                                        announcement={announcement}
                                        setAnnouncement={setAnnouncement}
                                    />
                                )}

                                {activeTabs[issue.id] === "feedback" &&
                                    issue.status === "Resolved" &&
                                    issue.feedback && (
                                        <FeedbackManage 
                                            issue={issue}
                                            toggleFeedback={toggleFeedback}
                                            showFeedback={showFeedback}
                                            fetchSentiment={fetchSentiment}
                                            loading={loading}
                                            sentiment={sentiment}
                                            overallScore={overallScore}
                                            positiveCount={positiveCount}
                                            negativeCount={negativeCount}
                                            neutralCount={neutralCount}
                                            positiveFeedback={positiveFeedback}
                                            negativeFeedback={negativeFeedback}
                                            neutralFeedback={neutralFeedback}
                                        />
                                    )}
                            </Box>

                        </Box>


                    </Card>
                )})}
            </Box>

        </Box>
    );
};

export default CurrentManaging;

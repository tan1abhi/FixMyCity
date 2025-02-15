import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchAuthToken, fetchStates, fetchCities } from '../Pages/locationApi';
import { handleError, handleSuccess } from '../Pages/utils';
// import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import './ViewIssues.css';


import { doc, updateDoc, getDoc , collection, getDocs , onSnapshot, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

import { State, City } from 'country-state-city';

// const libraries = ['places'];


const ViewIssues = () => {
    const [issues, setIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [authToken, setAuthToken] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [status, setStatus] = useState('');
    const [sortBy, setSortBy] = useState('mostRelevant');
    const [myReportsOnly, setMyReportsOnly] = useState(false);
    const [comment, setComment] = useState('');
    const [showComments, setShowComments] = useState({});
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAnnouncements, setShowAnnouncements] = useState({});
    const [showFeedback, setShowFeedback] = useState({});
    const [feedback, setFeedback] = useState("");
    /*const [selectedLocation, setSelectedLocation] = useState(null);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);*/

    const userName = localStorage.getItem('loggedInUser');
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    const defaultState = localStorage.getItem('state');
    const defaultCity = localStorage.getItem('city');

    /*
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyCf2dvOxtwdeaKhKv6pIfOt44XcOBifT3A',
        libraries: libraries,
    });*/



    useEffect(() => {
        setStates(State.getStatesOfCountry("IN"));
    }, []);

    // Fetch cities when state is selected
    useEffect(() => {
        if (selectedState) {
            setCities(City.getCitiesOfState("IN", selectedState));
        } else {
            setCities([]);
        }
    }, [selectedState]);

    // Fetch Auth Token
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await fetchAuthToken();
                setAuthToken(token);
            } catch (error) {
                console.error("Error fetching auth token:", error);
            }
        };
        fetchData();
    }, []);

    // Fetch States
    useEffect(() => {
        if (authToken) {
            const fetchStateData = async () => {
                try {
                    const stateList = await fetchStates(authToken);
                    setStates(stateList);
                } catch (error) {
                    console.error("Error fetching states:", error);
                }
            };
            fetchStateData();
        }
    }, [authToken]);

    // Fetch Cities for the selected state
    useEffect(() => {
        if (selectedState) {
            const fetchCityData = async () => {
                try {
                    const cityList = await fetchCities(authToken, selectedState);
                    setCities(cityList);
                } catch (error) {
                    console.error("Error fetching cities:", error);
                }
            };
            fetchCityData();
        } else {
            setCities([]);
        }
    }, [selectedState, authToken]);


    // Fetch all issues from the backend
    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const issuesCollection = collection(db, "issues"); // Firestore collection
                const querySnapshot = await getDocs(issuesCollection);
    
                const issuesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
    
                setIssues(issuesData);
            } catch (error) {
                console.error("Error fetching issues:", error);
            }
        };
    
        fetchIssues();
    }, []);
    
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "issues"), (snapshot) => {
            const updatedIssues = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setIssues(updatedIssues);
        });

        return () => unsubscribe(); // Cleanup the listener on unmount
    }, []);

    // Function to apply filters and sorting
    const applyFiltersAndSort = () => {
        let filtered = [...issues];

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(issue =>
                issue.issueTitle.toLowerCase().includes(searchQuery) ||
                issue.description.toLowerCase().includes(searchQuery)
            );
        }

        // Filter by "My Reports"
        if (myReportsOnly) {
            filtered = filtered.filter(issue => issue.email === email);
        }

        // Filter by state - if state is not selected or is empty, don't filter by state
        if (selectedState && selectedState !== "") {
            filtered = filtered.filter(issue => issue.state === selectedState);
        }

        // If a specific city is selected, filter by city
        if (selectedCity && selectedCity !== "") {
            filtered = filtered.filter(issue => issue.city === selectedCity);
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
    }, [selectedState, selectedCity, status, sortBy, myReportsOnly, issues]);


    // Handle upvote or downvote
    const handleVote = async (issueId, voteType) => {
        const userId = localStorage.getItem("userId"); // Get userId from localStorage

        console.log("Voting on issue:", issueId, "with vote:", voteType);
        console.log("User ID:", userId);
    
        if (!userId) {
            handleError("You need to log in to vote.");
            return;
        }
    
        try {
            const issueRef = doc(db, "issues", issueId);
            const issueSnapshot = await getDoc(issueRef);
    
            if (!issueSnapshot.exists()) {
                handleError("Issue not found.");
                return;
            }
    
            const issueData = issueSnapshot.data();
            let userVotes = issueData.userVotes || {}; // ✅ Ensure userVotes is always an object
    
            if (!userVotes || typeof userVotes !== "object") {
                userVotes = {}; // ✅ Initialize if it's still undefined
            }
    
            const previousVote = userVotes[userId] || null; // Get previous vote safely
    
            if (previousVote === voteType) {
                // If user is undoing their vote
                delete userVotes[userId];
            } else {
                // Otherwise, update their vote
                userVotes[userId] = voteType;
            }
    
            // Calculate new vote counts safely
            let upvotes = issueData.upvotes || 0;
            let downvotes = issueData.downvotes || 0;
    
            if (previousVote === "upvote") upvotes--;
            if (previousVote === "downvote") downvotes--;
    
            if (voteType === "upvote" && previousVote !== "upvote") upvotes++;
            if (voteType === "downvote" && previousVote !== "downvote") downvotes++;
    
            // Update Firestore
            await updateDoc(issueRef, {
                upvotes,
                downvotes,
                userVotes
            });
    
            handleSuccess("Vote updated successfully!");
    
        } catch (error) {
            console.error("Error voting:", error);
            handleError("An error occurred while processing your vote.");
        }
    };




    // Handle adding a comment
    
const handleComment = async (issueId) => {
    if (!comment.trim()) {
        handleError("Comment cannot be empty.");
        return;
    }

    try {
        const issueRef = doc(db, "issues", issueId); // Reference to the Firestore document

        // Update Firestore document by adding the new comment
        await updateDoc(issueRef, {
            comments: arrayUnion({ userName, text: comment, timestamp: new Date().toISOString() })
        });

        // Update local state to reflect the new comment dynamically
        setIssues(issues.map(issue =>
            issue.id === issueId 
                ? { ...issue, comments: [...(issue.comments || []), { userName, text: comment, timestamp: new Date().toISOString() }] } 
                : issue
        ));

        handleSuccess("Comment added successfully!");
        setComment(""); // Clear the comment input field
    } catch (error) {
        handleError("Failed to add comment. Please try again.");
        console.error("Error adding comment:", error);
    }
};


    // Handle adding Feedback
    const handleFeedback = async (issueId) => {
        if (!feedback.trim()) {
            handleError("Feedback cannot be empty.");
            return;
        }
    
        try {
            const issueRef = doc(db, "issues", issueId); // Reference to Firestore document
    
            // Update Firestore: Add feedback to the array
            await updateDoc(issueRef, {
                feedback: arrayUnion({ userName, feedback, timestamp: new Date().toISOString() }) // Append new feedback
            });
    
            handleSuccess("Feedback added successfully!");
    
            
    
            setFeedback(""); // Clear input field
        } catch (error) {
            handleError("An unexpected error occurred. Please try again.");
            console.error("Error adding feedback:", error);
        }
    };
    
    
    
    // Reset city filter to "All Cities" when "All States" is selected
    useEffect(() => {
        if (selectedState === '') {
            setSelectedCity(''); // Reset city filter when "All States" is selected
        }
    }, [selectedState]);


    // Function to handle media click
    const handleMediaClick = (mediaUrl) => {
        setSelectedMedia(mediaUrl);
    };

    // Function to close the modal
    const closeMediaModal = () => {
        setSelectedMedia(null);
    };

    // Search on the Basis of Title
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
    
        // Filter issues based on title or description
        const filtered = issues.filter(issue => 
            issue.issueTitle.toLowerCase().includes(query) || 
            issue.description.toLowerCase().includes(query)
        );
    
        setFilteredIssues(filtered);
    };


    // Map
    /*
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
        if (!map) return;

        const latLng = new window.google.maps.LatLng(location.coordinates[1], location.coordinates[0]);

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
        setSelectedLocation(location);
        updateMapWithLocation(location);
    };
    
    const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi*/


    const toggleComments = (issueId) => {
        setShowComments((prev) => ({
            ...prev,
            [issueId]: !prev[issueId],
        }));
    };

    const toggleAnnouncements = (issueId) => {
        setShowAnnouncements((prev) => ({
            ...prev,
            [issueId]: !prev[issueId],
        }));
    };

    const toggleFeedback = (issueId) => {
        setShowFeedback((prev) => ({
            ...prev,
            [issueId]: !prev[issueId],
        }));
    };






    return (
        <div className="view-issues">
            <h2 className="view-issues__title">View Issues</h2>

            <div className="view-issues__search">
                <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            {/* Embedded Map */}
            {/* <div className="view-issues__map">
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '300px' }}
                        center={selectedLocation ? { lat: selectedLocation.coordinates[1], lng: selectedLocation.coordinates[0] } : defaultCenter}
                        zoom={selectedLocation ? 16 : 10}
                        onLoad={onMapLoad}
                        onUnmount={onMapUnmount}
                    />
                ) : (
                    <p>Loading map...</p>
                )}
            </div> */}

            {/* Filters Section */}
            {/* My Reports */}
            <div className="view-issues__filters">
                <label className="filter-checkbox">
                    <input
                        type="checkbox"
                        checked={myReportsOnly}
                        onChange={() => setMyReportsOnly(!myReportsOnly)}
                    />
                    View My Reports
                </label>

                {/* State Filter */}
                <div className="filter-group">
                        <label htmlFor="state" className="filter-label">State:</label>
                        <select
                            id="state"
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All States</option>
                            {states.map((state, index) => (
                                <option key={index} value={state.isoCode}>{state.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* City Filter */}
                    <div className="filter-group">
                        <label htmlFor="city" className="filter-label">City:</label>
                        <select
                            id="city"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            disabled={!selectedState}
                            className="filter-select"
                        >
                            <option value="">All Cities</option>
                            {cities.map((city, index) => (
                                <option key={index} value={city.name}>{city.name}</option>
                            ))}
                        </select>
                    </div>


                {/* Status Filter */}
                <div className="filter-group">
                    <label htmlFor="status" className="filter-label">Status:</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In-Progress">In-Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>

                {/* Sorting */}
                <div className="filter-group">
                    <label htmlFor="sortBy" className="filter-label">Sort By:</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="mostRelevant">Most Relevant</option>
                        <option value="mostRecent">Most Recent</option>
                    </select>
                </div>
            </div>

            {/* Issues List */}
            <div className="view-issues__list">
                {Array.isArray(filteredIssues) && filteredIssues.map((issue) => {

                    const formattedDate = issue.dateOfComplaint 
                    ? (issue.dateOfComplaint.toDate ? issue.dateOfComplaint.toDate() : new Date(issue.dateOfComplaint))
                    : null;

                    console.log("Issue ID:", issue.id);
                    console.log("Issue Title:", issue.issueTitle);
                    console.log("Issue Date:", formattedDate ? formattedDate.toLocaleDateString() : "Invalid Date");
                return(
                    <div key={issue.id} className="issue-card">
                        <h3 className="issue-card__title">{issue.issueTitle}</h3>
                        <p className="issue-card__description">{issue.description}</p>
                        <p className="issue-card__date"><strong>Date:</strong> {formattedDate ? formattedDate.toLocaleDateString() : "Invalid Date"}</p>
                        <p className="issue-card__location"><strong>State:</strong> {issue.state}</p>
                        <p className="issue-card__location"><strong>City:</strong> {issue.city}</p>

                        {/* <button
                            onClick={() => handleViewOnMap(issue.location)}
                            className="view-on-map-button"
                        >
                            View on Map
                        </button> */}

                        <p className="issue-card__status"><strong>Status:</strong> {issue.status}</p>

                        {/* Media Section */}
                        {issue.media && issue.media.length > 0 && (
                            <div className="issue-card__media">
                            <h4>Media:</h4>
                            {issue.media && issue.media.length > 0 ? (
                                <div className="media-gallery">
                                    {issue.media.map((mediaItem, index) => {
                                        console.log("Media Item:", mediaItem); // Debugging log
                                        
                                        if (!mediaItem || !mediaItem.url || !mediaItem.type) {
                                            console.warn(`Skipping invalid media at index ${index}`, mediaItem);
                                            return null;
                                        }
                        
                                        return mediaItem.type.includes("image") ? (  // ✅ Adjusted check
                                            <img
                                                key={index}
                                                src={mediaItem.url}
                                                alt={`Media ${index + 1}`}
                                                className="media-thumbnail"
                                                onClick={() => handleMediaClick(mediaItem.url)}
                                            />
                                        ) : mediaItem.type.includes("video") ? (  // ✅ Adjusted check
                                            <video key={index} controls className="media-thumbnail">
                                                <source src={mediaItem.url} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : null;
                                    })}
                                </div>
                            ) : (
                                <p>No media available</p>
                            )}
                        </div>
                        
                        )}

                        {selectedMedia && (
                            <div className="media-modal" onClick={closeMediaModal}>
                                <div className="media-modal__content" onClick={(e) => e.stopPropagation()}>
                                    <button className="media-modal__close-button" onClick={closeMediaModal}>
                                        &times;
                                    </button>

                                    {/* Detect if media is image or video */}
                                    {selectedMedia.includes(".mp4") || selectedMedia.includes(".webm") || selectedMedia.includes(".ogg") ? (
                                        <video controls className="media-modal__video">
                                            <source src={selectedMedia} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <img src={selectedMedia} alt="Enlarged Media" className="media-modal__image" />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Vote Section */}
                        <div className="issue-card__votes">
                            <button
                                onClick={() => handleVote( issue.id , 'upvote')}
                                className="vote-button"
                            >
                                Upvote
                            </button>
                            <span className="vote-count">{issue.upvotes} Upvotes</span>
                            <button
                                onClick={() => handleVote( issue.id , 'downvote')}
                                className="vote-button"
                            >
                                Downvote
                            </button>
                            <span className="vote-count">{issue.downvotes} Downvotes</span>
                        </div>

                        

                        {/* View Managing Authorities */}
                        {issue.managingAuthorities && issue.managingAuthorities.length > 0 && (
                            <div className="issue-card__authorities">
                                <h4>Managing Authorities:</h4>
                                <ul>
                                    {issue.managingAuthorities.map((authority, index) => (
                                        <li key={index}>
                                            {authority.Authority} {/* Displaying the name of the authority */}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        

                        {/* Comments Section */}
                        <div className="comments-section">
                            <button
                                onClick={() => toggleComments(issue.id)}
                                className="comments-toggle-button"
                            >
                                {showComments[issue.id]
                                    ? "Hide Comments"
                                    : "View Comments"}
                            </button>

                            {showComments[issue.id] && (
                                <div className="comments-list">
                                    <h4 className="comments-title">Comments:</h4>
                                    <ul className="comments-ul">
                                        {issue.comments.map((c, idx) => (
                                            <li key={idx} className="comment-item">
                                                <strong>{c.userName}:</strong> {c.text}
                                                <br />
                                                <em className="comment-time">
                                                ({c.timestamp ? new Date(c.timestamp).toLocaleString() : "Invalid Date"})
                                                </em>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Disable Comment Input for Resolved Issues */}
                            {issue.status !== "Resolved" ? (
                                <>
                                    <input
                                        type="text"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Add a comment"
                                        className="comment-input"
                                    />
                                    <button
                                        onClick={() => handleComment(issue.id)}
                                        className="comment-button"
                                    >
                                        Comment
                                    </button>
                                </>
                            ) : (
                                <p className="resolved-message">
                                    Comments are disabled for resolved issues.
                                </p>
                            )}
                        </div>


                        {/* Announcements Section */}
                        <div className="announcements-section">
                            <button onClick={() => toggleAnnouncements(issue.id)} className="announcements-toggle-button">
                                {showAnnouncements[issue.id] ? 'Hide Announcements' : 'View Announcements'}
                            </button>

                            {showAnnouncements[issue.id] && (
                                <div className="announcements-list">
                                    <h4 className="announcements-title">Announcements:</h4>
                                    <ul className="announcements-ul">
                                        {issue.announcements.map((announcement, idx) => (
                                            <li key={idx} className="announcement-item">
                                                <strong>{announcement.userName}:</strong> {announcement.text}
                                                <br />
                                                <em className="announcement-time">({new Date(announcement.timestamp).toLocaleString()})</em>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>



                        {/* Feedback Section for Resolved Issues */}
                        {issue.status === "Resolved" && (
                            <div className="feedback-section">
                                {/* Feedback Input Section */}
                                <div className="feedback-input-section">
                                    <h4 className="feedback-input-title">Submit Your Feedback:</h4>
                                    <input
                                        type="text"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Write your feedback..."
                                        className="feedback-input"
                                    />
                                    <button
                                        onClick={() => handleFeedback(issue.id)}
                                        className="feedback-button"
                                    >
                                        Submit Feedback
                                    </button>
                                </div>

                                {/* Feedback List Toggle */}
                                <button
                                    onClick={() => toggleFeedback(issue.id)}
                                    className="feedback-toggle-button"
                                >
                                    {showFeedback[issue.id] ? "Hide Feedback" : "View Feedback"}
                                </button>

                                {/* Feedback List */}
                                {showFeedback[issue.id] && (
                                    <div className="feedback-list">
                                        <h4 className="feedback-title">Feedback:</h4>
                                        <ul className="feedback-ul">
                                            {issue.feedback.map((f, idx) => (
                                                <li key={idx} className="feedback-item">
                                                    <strong>{f.userName}:</strong> {f.feedback}
                                                    <br />
                                                    <em className="feedback-time">
                                                        ({new Date(f.timestamp).toLocaleString()})
                                                    </em>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )})}
            </div>
        </div>
    );
};

export default ViewIssues;

import React, { useState, useEffect } from 'react';
import { handleError, handleSuccess } from '../Pages/utils';
import '../UserPages/ViewIssues.css';

import { doc, updateDoc, getDoc , collection, getDocs , onSnapshot, arrayUnion , arrayRemove } from "firebase/firestore";
import { db , firestore } from "../firebase/firebaseConfig";


const CurrentManaging = () => {
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

    const name = localStorage.getItem('loggedInUser');
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');



    // Fetch all issues from the backend
    const fetchIssues = async () => {
        try {
            console.log("Fetching issues...");
    
            const userId = localStorage.getItem("userId");
    
            if (!userId) {
                console.error("User ID not found in localStorage.");
                handleError("User ID not found.");
                return;
            }
    
            console.log(`User ID found: ${userId}`);

        
    
            // Query Firestore for issues where managingAuthorities contains the userId
            const issuesCollection = collection(db, "issues"); // Firestore collection
            const querySnapshot = await getDocs(issuesCollection);
                
            const issuesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
    
            console.log("Issues fetched:", issuesData);
    
            setIssues(issuesData);
            setFilteredIssues(issuesData); // Initialize filtered issues
        } catch (error) {
            console.error("Error fetching issues:", error);
            handleError("Failed to fetch issues.");
        }
    };
    
 
    // Fetch issues when the component mounts or dependencies change
    useEffect(() => {
        fetchIssues();
    }, [token, userRole]);


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
    }, [status, sortBy, issues]);


    // Search box to search Issues by Title
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = issues.filter(issue =>
            issue.issueTitle.toLowerCase().includes(query) ||
            issue.description.toLowerCase().includes(query)
        );

        setFilteredIssues(filtered);
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
    
            await updateDoc(issueRef, {
                status: newStatus
            });
    
            console.log("Status updated successfully");
    
            // Handle success message
            handleSuccess("Status updated successfully");
    
            // Update local state to reflect the change
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
            fetchIssues();
        } catch (error) {
            console.error("Error managing authority:", error);
            handleError("An error occurred while managing the authority.");
        }
    };
    
    
    // "Unmanage" a Issue
    const handleUnmanageAuthority = async (issueId) => {
        const userId = localStorage.getItem("userId"); // Authority ID
    
        try {
            console.log(`Removing authority (ID: ${userId}) from issue ${issueId}...`);
    
            const issueRef = doc(firestore, "issues", issueId);
    
            // Fetch current issue data to get the full authority object
            const issueSnapshot = await firestore.getDoc(issueRef);
            if (!issueSnapshot.exists()) {
                throw new Error("Issue not found");
            }
    
            const issueData = issueSnapshot.data();
            const authorityToRemove = issueData.managingAuthorities.find(auth => auth.Id === userId);
    
            if (!authorityToRemove) {
                console.warn("Authority not found in issue.");
                handleError("Authority not found.");
                return;
            }
    
            // Update Firestore to remove the authority
            await updateDoc(issueRef, {
                managingAuthorities: arrayRemove(authorityToRemove)
            });
    
            console.log("Authority removed successfully");
    
            // Handle success message
            handleSuccess("Authority removed successfully");
    
            // Re-fetch issues to reflect the update
            fetchIssues();
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
    
            // Update issues state to reflect the new announcement
            setIssues((prevIssues) =>
                prevIssues.map((issue) =>
                    issue.id === issueId
                        ? {
                            ...issue,
                            announcements: [
                                ...(issue.announcements || []),
                                {
                                    userName,
                                    comment: announcementText,
                                    timestamp: new Date().toISOString(),
                                }
                            ]
                        }
                        : issue
                )
            );
    
            setAnnouncement(""); // Clear the input field
        } catch (error) {
            console.error("Error adding announcement:", error);
            handleError("An unexpected error occurred. Please try again.");
        }
    };
    


    // Analyse sentiment of the feedbacks
    const fetchSentiment = async (issueId) => {
        setLoading(true); // Start loading
        try {
            console.log(`Fetching sentiment for issue: ${issueId}`);
    
            const issueRef = doc(firestore, "issues", issueId);
            const issueSnapshot = await getDoc(issueRef);
    
            if (!issueSnapshot.exists()) {
                throw new Error("Issue not found.");
            }
    
            const issueData = issueSnapshot.data();
    
            if (issueData.sentiment) {
                setSentiment(issueData.sentiment); // Update state with sentiment data
                handleSuccess("Sentiment fetched successfully");
            } else {
                handleError("Sentiment data not available for this issue.");
            }
        } catch (error) {
            console.error("Error fetching sentiment:", error);
            handleError("Error fetching sentiment.");
        } finally {
            setLoading(false); // Stop loading after request is complete
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



    

    return (
        <div className="view-issues">
            <h2 className="view-issues__title">View Issues</h2>

            {/* Search Box */}
            <div className="view-issues__search">
                <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            {/* Filter and Sorting */}
            <div className="view-issues__filters">

                {/* Sort on Basis of Status */}
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

                    return (
                    <div key={issue.id} className="issue-card">
                        <h3 className="issue-card__title">{issue.issueTitle}</h3>
                        <p className="issue-card__description">{issue.description}</p>
                        <p className="issue-card__date"><strong>Date:</strong> {formattedDate ? formattedDate.toLocaleDateString() : "Invalid Date"}</p>
                        <p className="issue-card__location"><strong>State:</strong> {issue.state}</p>
                        <p className="issue-card__location"><strong>City:</strong> {issue.city}</p>


                        {/* Update Status Dropdown */}
                        <div className="issue-status">
                            <label htmlFor={`status-${issue.id}`} className="status-label">Update Status:</label>
                            <select
                                id={`status-${issue.id}`}
                                value={issue.status}
                                onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                                className="status-dropdown"
                            >
                                {/* Only allow changing from Pending to In-Progress */}
                                <option value="Pending" disabled={issue.status !== "Pending"}>Pending</option>
                                
                                {/* Only allow changing from In-Progress to Resolved */}
                                <option value="In-Progress" disabled={issue.status !== "Pending" && issue.status !== "In-Progress"}>In-Progress</option>
                                
                                {/* Only allow changing from Resolved to no other option */}
                                <option value="Resolved" disabled={issue.status !== "In-Progress"}>Resolved</option>
                            </select>
                        </div>


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
                            <span className="vote-count">{issue.upvotes} Upvotes</span>
                            <span className="vote-count">{issue.downvotes} Downvotes</span>
                        </div>


                        {/* Manage or Unmanage */}
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

                        <button
                            className="manage-button"
                            onClick={() => {
                                if (issue.managingAuthorities.some(authority => authority.Id === localStorage.getItem('userId'))) {
                                    handleUnmanageAuthority(issue.id);
                                } else {
                                    handleManageAuthority(issue.id);
                                }
                            }}
                        >
                            {issue.managingAuthorities.some(authority => authority.Id === localStorage.getItem('userId')) ? 'Unmanage' : 'Manage'}
                        </button>


                        {/* Comments Section */}
                        <div className="comments-section">
                            <button onClick={() => toggleComments(issue.id)} className="comments-toggle-button">
                                {showComments[issue.id] ? 'Hide Comments' : 'View Comments'}
                            </button>

                            {showComments[issue.id] && (
                                <div className="comments-list">
                                    <h4 className="comments-title">Comments:</h4>
                                    <ul className="comments-ul">
                                        {issue.comments.map((c, idx) => (
                                            <li key={idx} className="comment-item">
                                                <strong>{c.userName}:</strong> {c.text}
                                                <br />
                                                <em className="comment-time">({new Date(c.timestamp).toLocaleString()})</em>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
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
                                        {issue.announcements.map((a, idx) => (
                                            <li key={idx} className="announcement-item">
                                                <strong>{a.userName}:</strong> {a.comment} {/* Match schema fields */}
                                                <br />
                                                <em className="announcement-time">({new Date(a.timestamp).toLocaleString()})</em>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <input
                                type="text"
                                value={announcement}
                                onChange={(e) => setAnnouncement(e.target.value)}
                                placeholder="Add an announcement"
                                className="announcement-input"
                            />
                            <button onClick={() => handleAnnouncement(issue.id)} className="announcement-button">Announce</button>
                        </div>


                        {/* Feedback Section for Resolved Issues */}
                        {issue.status === "Resolved" && (
                            <div className="feedback-section">
                                {/* Toggle Feedback Button */}
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

                        {/* Sentiment Button and Result */}
                        <div>
                            {/* Only show the "Analyze Sentiment" button if the status is "Resolved" */}
                            {issue.status === "Resolved" && (
                                <button onClick={() => fetchSentiment(issue.id)} disabled={loading}>
                                    {loading ? "Analyzing..." : "Analyze Sentiment"}
                                </button>
                            )}

                            {/* Display sentiment only if the issue status is "Resolved" */}
                            {issue.status === "Resolved" && sentiment && (
                                <div className="sentiment-result">
                                    <h3>Overall Sentiment: {sentiment}</h3>
                                </div>
                            )}
                        </div>                        
                    </div>
                )})}
            </div>
        </div>
    );
};

export default CurrentManaging;

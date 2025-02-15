import React, { useState, useEffect } from 'react';
import { handleError, handleSuccess } from '../Pages/utils';
import '../UserPages/ViewIssues.css';

import { collection, query, where, getDocs , doc, updateDoc, arrayRemove, getDoc , arrayUnion } from "firebase/firestore";
import { db , firestore } from "../firebase/firebaseConfig";

const AdminView = () => {
    const [issues, setIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [status, setStatus] = useState('');
    const [sortBy, setSortBy] = useState('mostRelevant');
    const [searchQuery, setSearchQuery] = useState('');
    const [showComments, setShowComments] = useState({});
    const [showAnnouncements, setShowAnnouncements] = useState({});
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [showFeedback, setShowFeedback] = useState({});

    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const defaultState = localStorage.getItem('state');
    const defaultCity = localStorage.getItem('city');

    // Fetch all issues from the backend
    const fetchIssues = async () => {
        try {
            const token = localStorage.getItem("token");
            const userRole = localStorage.getItem("role");
            const defaultState = localStorage.getItem("state");
            const defaultCity = localStorage.getItem("city");
    
            console.log("Token:", token);
            console.log("User Role:", userRole);
            console.log("Default State:", defaultState);
            console.log("Default City:", defaultCity);
    
            if (!token) {
                console.error("User not authenticated.");
                return;
            }
    
            let issuesQuery = collection(db, "issues");
    
            if (userRole === "authority" && defaultState && defaultCity) {
                console.log("Applying filters for authority role...");
                issuesQuery = query(
                    issuesQuery,
                    where("state", "==", defaultState),
                    where("city", "==", defaultCity)
                );
            }
    
            console.log("Fetching issues from Firestore...");
            const querySnapshot = await getDocs(issuesQuery);
            console.log("Query Snapshot Size:", querySnapshot.size);
    
            const issuesData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
    
            console.log("Final Issues Data:", issuesData);
    
            setIssues(issuesData || []);
            setFilteredIssues(issuesData || []);
    
        } catch (error) {
            console.error("Error fetching issues from Firestore:", error);
            setIssues([]);
            setFilteredIssues([]);
        }
    };
    
    // Ensure fetchIssues runs on mount
    useEffect(() => {
        fetchIssues();
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


    // Search box to search Issues by their title
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


    // Function to "Manage" a issue
    const handleManageAuthority = async (issueId) => {
        const name = localStorage.getItem('loggedInUser'); // Authority name
        const userId = localStorage.getItem('userId'); // Authority ID
    
        try {
            const issueRef = doc(firestore, "issues", issueId); // Reference to the issue document
    
            await updateDoc(issueRef, {
                managingAuthorities: arrayUnion({ Authority: name, Id: userId }) // Add the new authority
            });
    
            handleSuccess("Authority added successfully.");
            fetchIssues(); // Re-fetch issues to reflect the update
        } catch (error) {
            console.error("Error managing authority:", error);
            handleError("An error occurred while managing the authority.");
        }
    };
    
    // Function to "Unmanage" a issue
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
                fetchIssues(); // Re-fetch issues to reflect the update
            } else {
                handleError("Issue not found.");
            }
        } catch (error) {
            console.error("Error unmanaging authority:", error);
            handleError("An error occurred while unmanaging the authority.");
        }
    };
    


    // Toggle comment visibility for a specific issue
    const toggleComments = (issueId) => {
        setShowComments((prev) => ({
            ...prev,
            [issueId]: !prev[issueId],
        }));
    };

    // Toggle announcement visibility for a specific issue
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

                {/* on Basis of Status */}
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
                        <p className="issue-card__date"><strong>Date:</strong> {formattedDate ? formattedDate.toLocaleDateString() : "Invalid Date"} </p>
                        <p className="issue-card__location"><strong>State:</strong> {issue.state}</p>
                        <p className="issue-card__location"><strong>City:</strong> {issue.city}</p>

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
                            {issue && issue.managingAuthorities && issue.managingAuthorities.some(authority => authority.Id === localStorage.getItem('userId')) ? 'Unmanage' : 'Manage'}
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
                                        {issue.announcements.map((announcement, idx) => (
                                            <li key={idx} className="announcement-item">
                                                <strong>{announcement.userName}:</strong> {announcement.comment}
                                                <br />
                                                <em className="announcement-time">({new Date(announcement.time).toLocaleString()})</em>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
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
                                                    <strong>{f.userName}:</strong> {f.comment}
                                                    <br />
                                                    <em className="feedback-time">
                                                        ({new Date(f.time).toLocaleString()})
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

export default AdminView;

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Issue = require('../Models/Issue');
const User = require('../Models/User');
const axios = require("axios"); // For HTTP requests

import { db } from "../firebase/firebaseConfig.js"; 
import { collection, getDocs , doc, getDoc, updateDoc  } from "firebase/firestore"; 



// RESIDENTS

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/media';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage }).array('media', 10);


const createIssue = async (req, res) => {
    try {
        const { issueTitle, description, city, state, name, email } = req.body;

        const newIssue = new Issue({
            issueTitle,
            description,
            name,
            email,
            city,
            state,
            media: req.files.map(file => file.path),
        });

        await newIssue.save();

        res.status(201).json({ message: 'Issue reported successfully.', issue: newIssue });
    } catch (error) {
        console.error('Error reporting the issue.', error);
        res.status(500).json({ message: 'Error reporting the issue.' });
    }
};


const getAllIssues = async (req, res) => {
    try {
        const issuesCollection = collection(db, "issues");
        const querySnapshot = await getDocs(issuesCollection);

        const issues = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json(issues);
    } catch (error) {
        res.status(500).json({ message: "Error fetching issues.", error: error.message });
    }
};


const addComment = async (req, res) => {
    try {
        const { issueId, userName, comment } = req.body;
        const issue = await Issue.findById(issueId);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found.' });
        }

        issue.comments.push({ userName, comment });
        await issue.save();

        res.status(200).json({ message: 'Comment added successfully.', comments: issue.comments });
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment.', error: error.message });
    }
};


const voteIssue = async (req, res) => {
    try {
        const { issueId, userId, voteType } = req.body; // voteType: 'upvote' or 'downvote'
        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        const issueRef = doc(db, "issues", issueId);
        const issueSnap = await getDoc(issueRef);

        if (!issueSnap.exists()) {
            return res.status(404).json({ message: "Issue not found." });
        }

        const issueData = issueSnap.data();
        let userVotes = issueData.userVotes || {}; // ✅ Ensure userVotes exists

        if (typeof userVotes !== "object") {
            userVotes = {}; // ✅ Initialize if it's invalid
        }

        const previousVote = userVotes[userId] || null; // ✅ Get previous vote safely

        // ✅ Toggle Vote Logic: Remove old vote, add new vote
        let upvotes = issueData.upvotes || 0;
        let downvotes = issueData.downvotes || 0;

        if (previousVote === "upvote") upvotes--;
        if (previousVote === "downvote") downvotes--;

        if (voteType === "upvote" && previousVote !== "upvote") upvotes++;
        if (voteType === "downvote" && previousVote !== "downvote") downvotes++;

        if (previousVote === voteType) {
            delete userVotes[userId]; // ✅ Undo vote if clicked twice
        } else {
            userVotes[userId] = voteType; // ✅ Save new vote
        }

        await updateDoc(issueRef, {
            upvotes,
            downvotes,
            userVotes, // ✅ Save userVotes
        });

        res.status(200).json({
            message: `Issue ${voteType}d successfully.`,
            issue: { ...issueData, upvotes, downvotes, userVotes },
        });
    } catch (error) {
        res.status(500).json({ message: "Error voting the issue.", error: error.message });
    }
};



const addFeedback = async (req, res) => {
    try {
        const { issueId, userName, feedback } = req.body;
        const issue = await Issue.findById(issueId);

        if (!issue) {
            return res.status(404).json({ message: "Issue not found." });
        }

        issue.feedback.push({ userName, comment: feedback });
        await issue.save();

        res.status(200).json({
            message: "Feedback added successfully.",
            feedback: issue.feedback,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error adding feedback.",
            error: error.message,
        });
    }
};



// AUTHORITY

const getIssuesByLocation = async (req, res) => {
    try {
        const { role } = req.user; // Assuming `req.user` contains the logged-in user's data
        const { defaultCity, defaultState } = req.query; // Get defaultCity and defaultState from query parameters

        // Initialize the filter object
        const filter = {};

        // If the defaultCity is not "All Cities", filter by city
        if (defaultCity && defaultCity !== "All Cities") {
            filter.city = defaultCity;
        }

        // If the defaultState is not "All States", filter by state
        if (defaultState && defaultState !== "All States") {
            filter.state = defaultState;
        }

        // Check if the user has the "Authority" role
        if (role !== 'Authority') {
            return res.status(403).json({ message: 'Access denied: Not authorized for this action.' });
        }

        // If no filters are applied, fetch all issues
        const issues = await Issue.find(filter);

        res.status(200).json(issues);
    } catch (error) {
        console.error('Error fetching issues by location.', error);
        res.status(500).json({ message: 'Error fetching issues by location.', error: error.message });
    }
};


const addManagingAuthority = async (req, res) => { 
    try {
        const { issueId, Authority, Id } = req.body; // Authority is the name, Id is the userId

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        // Check if the Id already exists in managingAuthorities
        if (!issue.managingAuthorities.some(authority => authority.Id === Id)) {
            issue.managingAuthorities.push({ Authority, Id, time: new Date() }); // Add the authority
            await issue.save();

            // Update the user's managingissue field
            const user = await User.findById(Id);
            if (user) {
                if (!user.managingissue.some(issue => issue.issueId === issueId)) {
                    user.managingissue.push({ issueId });
                    await user.save();
                }
            }

            return res.status(200).json({ message: "User added as managing authority" });
        }

        res.status(400).json({ message: "User is already managing this issue" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding managing authority" });
    }
};


const removeManagingAuthority = async (req, res) => {
    try {
        const { issueId, userId } = req.body; // Assuming issueId and userId are passed in the request body

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        // Find the index of the authority with the given userId
        const index = issue.managingAuthorities.findIndex(authority => authority.Id === userId); // Match 'Id' with userId
        if (index !== -1) {
            issue.managingAuthorities.splice(index, 1); // Remove the user from managing authorities
            await issue.save();

            // Update the user's managingissue field
            const user = await User.findById(userId);
            if (user) {
                user.managingissue = user.managingissue.filter(issue => issue.issueId !== issueId);
                await user.save();
            }

            return res.status(200).json({ message: "User removed from managing authorities" });
        }

        res.status(400).json({ message: "User is not managing this issue" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error removing managing authority" });
    }
};


const getManagingIssues = async (req, res) => {
    try {
        const { userId } = req.query;  // Get userId from query parameters

        // Find the user and get their managing issues
        const user = await User.findById(userId).select('managingissue');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const issueIds = user.managingissue.map(issue => issue.issueId);

        // Fetch the issues that match the IDs
        const issues = await Issue.find({ _id: { $in: issueIds } });

        res.status(200).json(issues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching managing issues.', error: error.message });
    }
};


const addAnnouncement = async (req, res) => {
    try {
        const { issueId, userName, comment } = req.body; // Extract fields from request body
        console.log('Request Body:', req.body); // Debug log

        const issue = await Issue.findById(issueId);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found.' });
        }

        // Push announcement with all required fields
        issue.announcements.push({ userName, comment, time: new Date() });

        await issue.save();

        res.status(200).json({ message: 'Announcement added successfully.', announcements: issue.announcements });
    } catch (error) {
        console.error('Error in addAnnouncement:', error);
        res.status(500).json({ message: 'Error adding announcement.', error: error.message });
    }
};


const updateIssueStatus = async (req, res) => {
    const { issueId } = req.params;
    const { status } = req.body;

    try {
        // Validate the status value
        if (!["Pending", "In-Progress", "Resolved"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        // Log the received issueId and status
        console.log("Received issueId:", issueId);
        console.log("Received status:", status);

        // Find the issue and update its status
        const issue = await Issue.findByIdAndUpdate(
            issueId,
            { status: status },
            { new: true } // Return the updated issue
        );

        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        console.log("Issue status updated:", issue);
        return res.status(200).json({ message: "Status updated successfully", issue });
    } catch (error) {
        // Log the error stack to understand what went wrong
        console.error("Error updating issue status:", error.stack);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const fetchsentiment = async (req, res) => {
    const { issueId } = req.body;

    // Validate issueId
    if (!issueId) {
        console.error("Error: Issue ID is missing");
        return res.status(400).json({ message: "Issue ID is required" });
    }

    try {
        // Fetch issue from database
        console.log("Fetching issue with ID:", issueId);
        const issue = await Issue.findById(issueId);

        if (!issue) {
            console.error("Error: Issue not found");
            return res.status(404).json({ message: "Issue not found" });
        }

        console.log("Issue found:", issue);

        // Check if feedback exists
        const feedback = issue.feedback;
        if (!feedback || feedback.length === 0) {
            console.error("Error: No feedback available for this issue");
            return res.status(400).json({ message: "No feedback available for this issue" });
        }

        // console.log("Sending feedback to Flask server:", feedback.map((f) => f.comment));

        // Send feedback to Flask server
        let flaskResponse;
        try {
            flaskResponse = await axios.post("http://127.0.0.1:5000/analyze-sentiment", {
                feedback: feedback.map((f) => f.comment),
            });
        } catch (flaskError) {
            console.error("Error communicating with Flask server:", flaskError.message);
            return res.status(500).json({ message: "Error communicating with sentiment analysis service" });
        }

        console.log("Flask server response:", flaskResponse.data);

        // Extract sentiment from Flask response
        const { sentiment } = flaskResponse.data;

        // Send sentiment back to frontend
        res.status(200).json({ sentiment });
    } catch (error) {
        console.error("Error in postIssueId:", error.message);
        console.error(error.stack);
        res.status(500).json({ message: "Internal server error" });
    }
};




module.exports = {
    createIssue,
    upload,
    addComment,
    voteIssue,
    getAllIssues,
    getIssuesByLocation,
    addManagingAuthority,
    removeManagingAuthority,
    getManagingIssues,
    addAnnouncement,
    updateIssueStatus,
    addFeedback,
    fetchsentiment
};

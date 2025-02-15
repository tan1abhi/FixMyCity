const express = require('express');
const { createIssue, upload, addComment, voteIssue, getAllIssues, getIssuesByLocation, addManagingAuthority, removeManagingAuthority, 
    getManagingIssues, addAnnouncement, updateIssueStatus, addFeedback, fetchsentiment } = require('../Controllers/IssueController');
const ensureAuthenticated = require('../Middlewares/Auth');
const issueValidation = require('../Middlewares/IssueValidation');
const authorizeRoles = require("../Middlewares/RoleMiddleware"); 

const router = express.Router();

router.post('/report', ensureAuthenticated, authorizeRoles("Resident"), upload, issueValidation, createIssue);
router.get('/getissues', ensureAuthenticated, authorizeRoles("Resident"), getAllIssues);
router.post('/comment', ensureAuthenticated, authorizeRoles("Resident"), addComment);
router.post('/vote', ensureAuthenticated, authorizeRoles("Resident"), voteIssue);
router.post("/feedback", ensureAuthenticated, authorizeRoles("Resident"), addFeedback);


router.get('/getissuesauthority', ensureAuthenticated, authorizeRoles("Authority"), getIssuesByLocation);
router.put('/manage', ensureAuthenticated, authorizeRoles("Authority"), addManagingAuthority);
router.put('/unmanage', ensureAuthenticated, authorizeRoles("Authority"), removeManagingAuthority);
router.get('/getmanagingissue', ensureAuthenticated, authorizeRoles("Authority"), getManagingIssues);
router.post('/announcement', ensureAuthenticated, authorizeRoles("Authority"), addAnnouncement);
router.patch("/update-status/:issueId", ensureAuthenticated, authorizeRoles("Authority"), updateIssueStatus);
router.post("/sentiment", ensureAuthenticated, authorizeRoles("Authority"), fetchsentiment);





module.exports = router;

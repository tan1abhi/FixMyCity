const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IssueSchema = new Schema({
    issueTitle: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    dateOfComplaint: {
        type: Date,
        default: Date.now,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    // location: {
    //     type: {
    //         type: String,
    //         enum: ['Point'], // GeoJSON type
    //         required: true,
    //     },
    //     coordinates: {
    //         type: [Number], // [longitude, latitude]
    //         required: true,
    //     },
    // },    
    media: {
        type: [String], // Array of file paths
        default: [],
    },    
    status: {
        type: String,
        enum: ['Pending', 'In-Progress', 'Resolved'],
        default: 'Pending',
    },
    managingAuthorities: {
        type: [
            {
                Authority: String,
                Id: String,
                time: { type: Date, default: Date.now },
            },
        ],
        default: [],
    },
    announcements: {
        type: [
            {
                userName: String,
                comment: String,
                time: { type: Date, default: Date.now },
            },
        ],
        default: [],
    },
    comments: {
        type: [
            {
                userName: String,
                comment: String,
                time: { type: Date, default: Date.now },
            },
        ],
        default: [],
    },
    feedback: {
        type: [
            {
                userName: String,
                comment: String,
                time: { type: Date, default: Date.now },
            },
        ],
        default: [],
    },
    upvotes: {
        type: Number,
        default: 0,
    },
    downvotes: {
        type: Number,
        default: 0,
    },
    userVotes: {
        type: Map, // key=userId, value=voteType ('upvote' or 'downvote')
        of: String,
        default: {},
    },
});

module.exports = mongoose.model('issues', IssueSchema);
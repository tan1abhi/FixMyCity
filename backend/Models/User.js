const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ["Resident", "Authority"],
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    managingissue: {
        type: [
            {
                issueId: String,
            },
        ],
        default: [],
    },
}
,{
    timestamps: true,
}
);

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;
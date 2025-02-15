const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const issueRoutes = require('./Routes/IssueRoutes');

const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;


require('dotenv').config();   // .env file conatains important variables
require('./Models/db');
const PORT = process.env.PORT || 8080;

clientid = process.env.CLIENT_ID;
clientsecret = process.env.CLIENT_SECRET;

// used to check if the server is running and responding to requests
app.get('/ping', (req, res) => {
    res.send('PONG');
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); 

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json({ limit: '10mb' })); // For JSON requests
app.use(express.urlencoded({ limit: '10mb', extended: true })); // For URL-encoded requests


app.use('/auth', AuthRouter);
app.use('/issues', issueRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});

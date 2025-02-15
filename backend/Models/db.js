// UuWWcT8G7BuEbrr0
// sriya4social
// 122.161.52.212/32

const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_CONN;

mongoose.connect(mongo_url)
    .then(() => {
        console.log('MongoDB Connected...');
    }).catch((err) => {
        console.log('MongoDB Connection Error', err);
    })
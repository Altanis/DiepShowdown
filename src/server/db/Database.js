const { Schema } = require('mongoose');

const Users = new Schema({
    username: String,
    password: String, // hashed
    elo: Number, // ranking based off wins/losses
});

module.exports = { Users };
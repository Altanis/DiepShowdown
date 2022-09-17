const { Schema, model } = require('mongoose');

const Users = model('Users', new Schema({
    username: String,
    password: String, // hashed
    trainerID: String,
    hoursPlayed: Number,
    joinedAt: String,
    avatar: String,
    elo: Number, // ranking based off wins/losses
    color: [Number],
}));

const Ban = model('Ban', new Schema({
    ip: String,
    reason: String,
}));

module.exports = { Users, Ban };
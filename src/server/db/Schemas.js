const { Schema, model } = require('mongoose');

const Users = model('Users', new Schema({
    username: String,
    password: String, // hashed
    elo: Number, // ranking based off wins/losses
}));

const Ban = model('Ban', new Schema({
    ip: String,
    reason: String,
}));

module.exports = { Users, Ban };
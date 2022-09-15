const { Reader, Writer } = require('./BinaryCoder'),
    { OutgoingMessageHandler } = require('./OutgoingMessageHandler'),
    { Outgoing } = require('../enum/Payloads');
    
const bcrypt = require('bcrypt');

const IncomingMessageHandler = class {
    constructor(manager) { this.manager = manager; }

    login(buffer) {
        const database = this.manager.server.database;
        buffer = new Reader(buffer);

        const username = buffer.string(),
            password = buffer.string(),
            type = buffer.i8();

        switch (type) {
            case 0x00: { // LOGIN
                const user = database.retreive('Users', document => document.username === username)?.[0];

                if (!user) return this.manager.outgoingMsgHandler.error('Could not login: account with that username was not found.');
                if (!bcrypt.compareSync(password, user.password)) return this.manager.outgoingMsgHandler.error('Could not login: invalid password.');

                this.manager.user = user;
                break;
            }
            case 0x01: { // REGISTER
                // If botting becomes an issue, I will create a way to verify whether or not a bot or a real client is trying to register.

                if (!database.retreive('Users', document => document.username === username).length) 
                return this.manager.outgoingMsgHandler.error('Could not register account: that username is already taken.');
                
                database.create('Users', {
                    username,
                    password: bcrypt.hashSync(password, 10), // TODO: Hash password.
                    elo: 1000,
                })
                    .then(() => this.manager.outgoingMsgHandler.accepted(username))
                    .catch(er => console.error(er), this.manager.outgoingMsgHandler.error('Could not create account. Please try again later.'));
                break;
            }
            case 0x02: { // CHANGE_PASSWORD
                // Sending a CHANGE_PASSWORD request will have the format of [0x00, string(username), string(`${oldPW} + ${newPW}`), i8(type)]
                const user = database.retreive('Users', document => document.username === username)?.[0];
                if (!user) return this.manager.outgoingMsgHandler.error('Could not change password: account with that username was not found.');

                const [oldPassword, newPassword] = password.split(' + ');
                if (!bcrypt.compareSync(oldPassword, user.password)) return this.manager.outgoingMsgHandler.error('Could not change password: Old password is invalid.');

                //    edit(type, filter, prop, value) {
                database.edit('Users', document => document.username === username, 'password', bcrypt.hashSync(newPassword, 10));
                // ad response later gtg
            }
        }
    }
};
const OutgoingMessageHandler = class {
    constructor(manager) { this.manager = manager; }

    accepted(username) {
        this.manager.socket.send(new Writer().i8(0x01).string(username).out());
    }

    error(error) {
        this.manager.socket.send(new Writer().i8(0x02).string(error).out());
    }
};

module.exports = { IncomingMessageHandler, OutgoingMessageHandler };

/*
const { Reader, Writer } = require('./BinaryCoder'),
    { OutgoingMessageHandler } = require('./OutgoingMessageHandler'),
    { Outgoing } = require('../enum/Payloads');

module.exports = class IncomingMessageHandler {

}
*/
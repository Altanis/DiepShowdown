const { Reader, Writer } = require('./BinaryCoder'),
    { OutgoingMessageHandler } = require('./OutgoingMessageHandler'),
    { Outgoing } = require('../enum/Payloads');

const IncomingMessageHandler = class {
    constructor(manager) { this.manager = manager; }

    login(buffer) {
        const database = this.manager.server.database;
        buffer = new Reader(buffer);

        const username = buffer.string(),
            password = buffer.string();

        if (buffer.at !== buffer.buffer.length) { // If an ending byte exists, this signifies a user attempting to register.
            // If botting becomes an issue, I will create a way to verify whether or not a bot or a real client is trying to register.
            if (database.retreive('Users', document => document.username === username)) return this.manager.outgoingMsgHandler[Outgoing[0x02]]?.('Could not register account: that username is already taken.');
            database.create('Users', {
                username,
                password, // TODO: Hash password.
                elo: 1000,
            })
                .then(() => this.manager.outgoingMsgHandler[Outgoing[0x01]]?.(username))
                .catch(er => console.error(er), this.manager.outgoingMsgHandler[Outgoing[0x02]]?.(username));
        } else {

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
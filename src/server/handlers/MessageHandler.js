const { Reader, Writer } = require('./BinaryCoder');

const bcrypt = require('bcrypt'),
    { randomUUID } = require('node:crypto');

const IncomingMessageHandler = class {
    constructor(manager) { this.manager = manager; }

    login(buffer) {
        const database = this.manager.server.database;
        buffer = new Reader(buffer);

        const username = buffer.string(),
            password = buffer.string(),
            type = buffer.i8(),
            [r, g, b] = [buffer.i8(), buffer.i8(), buffer.i8()];

        switch (type) {
            case 0x00: { // LOGIN
                const user = database.retreive('Users', document => document.username === username)?.[0];

                if (!user) return this.manager.outgoingMsgHandler.error('Could not login: account with that username was not found.');
                if (!bcrypt.compareSync(password, user.password)) return this.manager.outgoingMsgHandler.error('Could not login: invalid password.');

                this.manager.user = user;
                this.manager.outgoingMsgHandler.accepted(user.trainerID, user.hoursPlayed, user.joinedAt, user.avatar, user.elo);
                break;
            }
            case 0x01: { // REGISTER
                // If botting becomes an issue, I will create a way to verify whether or not a bot or a real client is trying to register.
                if (database.retreive('Users', document => document.username === username).length) return this.manager.outgoingMsgHandler.error('Could not register account: that username is already taken.');
                
                database.create('Users', {
                    username,
                    password: bcrypt.hashSync(password, 10),
                    trainerID: randomUUID(),
                    hoursPlayed: 0,
                    joinedAt: new Date().toLocaleString('en-US', {
                        hour12: false,
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric"
                    }),
                    avatar: 'Overlord',
                    elo: 1000,
                    color: [r, g, b],
                })
                    .then(user => (this.manager.user = user, this.manager.outgoingMsgHandler.accepted(user.trainerID, user.hoursPlayed, user.joinedAt, user.avatar, user.elo)))
                    .catch(er => (console.error(er), this.manager.outgoingMsgHandler.error('Could not create account. Please try again later.')));
                break;
            }
            case 0x02: { // CHANGE_PASSWORD
                // Sending a CHANGE_PASSWORD request will have the format of [0x00, string(username), string(`${oldPW} + ${newPW}`), i8(type)]
                const user = database.retreive('Users', document => document.username === username)?.[0];
                if (!user) return this.manager.outgoingMsgHandler.error('Could not change password: account with that username was not found.');

                const [oldPassword, newPassword] = password.split(' + ');
                if (!bcrypt.compareSync(oldPassword, user.password)) return this.manager.outgoingMsgHandler.error('Could not change password: Old password is invalid.');

                database.edit('Users', document => document.username === username, 'password', bcrypt.hashSync(newPassword, 10))
                    .then(() => this.manager.outgoingMsgHandler.accepted(user.trainerID, user.hoursPlayed, user.joinedAt, user.avatar, user.elo))
                    .catch(er => (console.error(er), this.manager.outgoingMsgHandler.error('Could not change password. Please try again later.')));
            }
        }
    }

    chat(buffer) {
        if (!this.manager.user) return (console.log('WTF?'), this.manager.remove(true, 'Sent a CHAT packet before logging in.'));
        if (Date.now() - this.manager.lastMessageSent < 1000) return this.manager.outgoingMsgHandler.error('Could not send message: Spam was detected.');

        buffer = new Reader(buffer);
        const content = buffer.string();

        let slur;
        content.split(' ').forEach(word => {
            if (['fag', 'faggot', 'nig', 'nigger', 'nigga', 'retard', 'chink', 'tranny'].includes(word)) return (slur = true, this.manager.outgoingMsgHandler.error('Could not send message: Message contained a blocked word.')); 
        });
        if (slur) return;

        this.manager.lastMessageSent = Date.now();
    
        for (const socket of this.manager.server.sockets) {
            socket.outgoingMsgHandler.chat(this.manager.user.username, this.manager.user.color, content);
        }
    }
};
const OutgoingMessageHandler = class {
    constructor(manager) { this.manager = manager; }

    accepted(id, hours, joinDate, avatar, elo) {
        this.manager.socket.send(new Writer().i8(0x01).string(id).f32(hours).string(joinDate).string(avatar).f32(elo).out());
    }

    error(error) {
        this.manager.socket.send(new Writer().i8(0x02).string(error).out());
    }

    chat(username, [r, g, b], message) {
        this.manager.socket.send(new Writer().i8(0x03).string(username).i8(r).i8(g).i8(b).string(message).out());
    }
};

module.exports = { IncomingMessageHandler, OutgoingMessageHandler };
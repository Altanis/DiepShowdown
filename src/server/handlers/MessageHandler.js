const bcrypt = require('bcrypt'),
    { randomUUID } = require('node:crypto');

const { BannedWords, NotificationTypes } = require('../Constants');
const BattleManager = require('./BattleManager');

const { Writer } = require('./BinaryCoder'),
    Tanks = require('../../data/Tanks'),
    Moves = require('../../data/Moves'),
    Abilities = require('../../data/Abilities');

const IncomingMessageHandler = class {
    constructor(manager) { this.manager = manager; }

    login(buffer) {
        const database = this.manager.server.database;

        const type = buffer.i8();

        switch (type) {
            case 0x00: { // LOGIN
                const username = buffer.string(),
                    password = buffer.string();
                const user = database.retreive('Users', document => document.username === username)?.[0];

                if (!user) return this.manager.outgoingMsgHandler.notification('Could not login: account with that username was not found.', 'error');
                if (!bcrypt.compareSync(password, user.password)) return this.manager.outgoingMsgHandler.notification('Could not login: invalid password.', 'error');

                this.manager.user = user;
                this.manager.outgoingMsgHandler.accepted(user.trainerID, user.hoursPlayed, user.joinedAt, user.avatar, user.elo);
                this.manager.outgoingMsgHandler.notification(`Welcome back, ${user.username}!`, 'success');
                break;
            }
            case 0x01: { // REGISTER
                // If botting becomes an issue, I will create a way to verify whether or not a bot or a real client is trying to register.
                if (this.manager.user) return this.manager.remove(true, 'Sent a REGISTER packet after logging in.');

                const username = buffer.string(),
                    password = buffer.string();
    
                let tmpUser = username.replaceAll(' ', '').toLowerCase(); // may cause memory pollution (?)
        
                if (username.length < 2 || username.length > 32) return this.manager.outgoingMsgHandler.notification('Could not perform action: Username must be within bounds of 2-32.', 'error');
                if (BannedWords.filter(word => tmpUser.includes(word)).length) return this.manager.outgoingMsgHandler.notification('Could not perform action: Username contains a blocked word.', 'error');
        
                let avatar = buffer.i8();
                const [r, g, b] = [buffer.i8(), buffer.i8(), buffer.i8()];
                
                if (database.retreive('Users', document => document.username === username).length) return this.manager.outgoingMsgHandler.notification('Could not register account: that username is already taken.', 'error');
                if (!Tanks[avatar]) avatar = 1; // <- may be an accident return this.manager.remove(true, 'Provided an invalid Avatar.');

                database.create('Users', {
                    username,
                    password: bcrypt.hashSync(password, 10),
                    trainerID: randomUUID(),
                    hoursPlayed: 0,
                    lastTick: 0,
                    joinedAt: new Date().toLocaleString('en-US', {
                        hour12: true,
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric"
                    }),
                    avatar: avatar,
                    elo: 1000,
                    color: [r, g, b],
                })
                    .then(user => {
                        this.manager.user = user;
                        this.manager.outgoingMsgHandler.accepted(user.trainerID, user.hoursPlayed, user.joinedAt, user.avatar, user.elo);
                        this.manager.outgoingMsgHandler.notification(`You have been registered successfully, ${user.username}!`, 'success');
                    })
                    .catch(er => (console.error(er), this.manager.outgoingMsgHandler.notification('Could not create account. Please try again later.', 'error')));
                break;
            }
            /*case 0x02: { // CHANGE_PASSWORD
                // Sending a CHANGE_PASSWORD request will have the format of [0x00, string(username), string(`${oldPW} + ${newPW}`), i8(type)]
                const user = database.retreive('Users', document => document.username === username)?.[0] || this.manager.user;
                if (!user) return this.manager.outgoingMsgHandler.notification('Could not change password: account with that username was not found.', 'error');

                const [oldPassword, newPassword] = password.split(' + ');
                if (!bcrypt.compareSync(oldPassword, user.password)) return this.manager.outgoingMsgHandler.notification('Could not change password: Old password is invalid.', 'error');

                database.edit('Users', document => document.username === username, { password: bcrypt.hashSync(newPassword, 10) })
                    .then(() => {
                        this.manager.outgoingMsgHandler.accepted(user.trainerID, user.hoursPlayed, user.joinedAt, user.avatar, user.elo);
                        this.manager.outgoingMsgHandler.notification('You have successfully changed your password!', 'success');
                    })
                    .catch(er => (console.error(er), this.manager.outgoingMsgHandler.notification('Could not change password. Please try again later.', 'error')));
                break;
            }*/
            case 0x02: { // CHANGE_PROFILE 
                if (!this.manager.user) return; // < may be an accident:  this.manager.remove(true, 'Sent a CHANGE_PROFILE packet before logging in.');
                console.log('test 1 passed');

                const type = buffer.i8();

                switch (type) {
                    case 0x00: { // CHANGE_AVATAR
                        const avatar = buffer.i8();
                        if (!Tanks[avatar]) return; // < may be an accident: this.manager.remove(true, 'Provided an invalid Avatar.');

                        database.edit('Users', document => document.username === this.manager.user.username, { avatar })
                            .then(() => this.manager.outgoingMsgHandler.notification('You have successfully changed your avatar!', 'success'))
                            .catch(er => (console.error(er), this.manager.outgoingMsgHandler.notification('Could not change avatar. Please try again later.', 'error')));
                        break;
                    }
                    case 0x01: { // CHANGE_COLOR
                        const [r, g, b] = [buffer.i8(), buffer.i8(), buffer.i8()];
                        database.edit('Users', document => document.username === this.manager.user.username, { color: [r, g, b] })
                            .then(() => this.manager.outgoingMsgHandler.notification('You have successfully changed your username color!', 'success'))
                            .catch(er => (console.error(er), this.manager.outgoingMsgHandler.notification('Could not change username color. Please try again later.', 'error')));

                        break;
                    }
                    case 0x02: { // CHANGE_USERNAME
                        console.log('test 2 passed');

                        const newUsername = buffer.string();
                        console.log(newUsername);
                        if (newUsername.length < 2 || newUsername.length > 32) return this.manager.outgoingMsgHandler.notification('Could not change username: Username must be within bounds of 2-32.', 'error');
                        if (database.retreive('Users', document => document.username === newUsername).length) return this.manager.outgoingMsgHandler.notification('Could not change username: that username is already taken.', 'error');

                        database.edit('Users', document => document.username === this.manager.user.username, { username: newUsername })
                            .then((doc) => {
                                console.log('test 3 passed');
                                console.log(doc);
                                this.manager.user.username = newUsername;
                                this.manager.outgoingMsgHandler.notification('You have successfully changed your username!', 'success');
                            })
                            .catch(er => (console.error(er), this.manager.outgoingMsgHandler.notification('Could not change username. Please try again later.', 'error')));

                        break;
                    }
                    case 0x03: { // CHANGE_PASSWORD
                        const newPassword = buffer.string();

                        database.edit('Users', document => document.username === this.manager.user.username, { password: bcrypt.hashSync(newPassword, 10) })
                            .then(() => this.manager.outgoingMsgHandler.notification('You have successfully changed your password!', 'success'))
                            .catch(er => (console.error(er), this.manager.outgoingMsgHandler.notification('Could not change password. Please try again later.', 'error')));

                        break;
                    }
                }
            }
        }
    }

    chat(buffer) {
        if (!this.manager.user) return (console.log('WTF?'), this.manager.remove(true, 'Sent a CHAT packet before logging in.'));
        if (Date.now() - this.manager.lastMessageSent < 1000) return this.manager.outgoingMsgHandler.notification('Could not send message: Spam was detected.', 'error');

        const content = buffer.string();

        let tmpContent = content.replaceAll(' ', '').toLowerCase(); // may cause memory pollution (?)
        if (BannedWords.filter(word => tmpContent.includes(word)).length) return this.manager.outgoingMsgHandler.notification('Could not send message: Message contains a blocked word.', 'error');

        this.manager.lastMessageSent = Date.now();
    
        for (const socket of this.manager.server.sockets) {
            socket.outgoingMsgHandler.chat(this.manager.user.username, this.manager.user.color, content);
        }
    }

    battle(buffer) {
        const team = {};

        const teamSize = 6,
            moveSize = 4;

        while (teamSize--) {
            const tankID = buffer.i8();
            if (tankID === 0) break;
            if (!Tanks[tankID]) return this.manager.remove(true, 'Provided an invalid Tank ID.');

            const abilityID = buffer.i8();
            if (!Abilities[abilityID]) return this.manager.remove(true, 'Provided an invalid Ability ID.');

            const key = team[tankID] ? `${tankID}+${Math.random()}` : tankID;
            team[key] = {
                ability: abilityID,
                moveset: [],
            };

            while (moveSize--) {
                const moveID = buffer.i8();
                if (moveID === 0) break;
                if (!Moves[moveID] || !Tanks[tankID].moveset.includes(Moves[moveID].name)) return this.manager.remove(true, 'Provided an invalid Move ID.');
                team[key].moveset.push(moveID);
            }

            if (buffer.i8() !== 0) return this.manager.remove(true, 'Provided a malformed team packet.');
        }

        this.manager.team = team;

        for (const socket of this.manager.server.sockets) {
            if (socket.waitingForBattle) {
                this.manager.waitingForBattle = socket.waitingForBattle = false;
                // [WARNING XD MOMENT XD WARNING]: This is a very bad way of doing this, but it works for now.
                this.manager.battle = new BattleManager(this.manager.server, this.manager, socket);
                socket.battle = new BattleManager(this.manager.server, socket, this.manager);

                this.manager.outgoingMsgHandler.battle(socket);
                socket.outgoingMsgHandler.battle(this.manager);
            } else this.manager.waitingForBattle = true;
        }
    }
};

const OutgoingMessageHandler = class {
    constructor(manager) { this.manager = manager; }

    accepted(id, hours, joinDate, avatar, elo) {
        this.manager.socket.send(new Writer().i8(0x01).string(id.slice(0, 8)).f32(hours).string(joinDate).i8(avatar).f32(elo).out());
    }

    notification(error, type) {
        const buffer = new Writer().i8(0x02).string(error);
        NotificationTypes[type]?.forEach(byte => buffer.i8(byte));

        this.manager.socket.send(buffer.out());
    }

    chat(username, [r, g, b], message) {
        this.manager.socket.send(new Writer().i8(0x03).string(username).i8(r).i8(g).i8(b).string(message).out());
    }

    battle(socket) {
        // Copilot literally auto made all this code v
        const team = socket.team;
        const buffer = new Writer().i8(0x04).i8(team.length);

        for (const [key, value] of Object.entries(team)) {
            const tankID = key.includes('+') ? key.split('+')[0] : key;
            buffer.i8(tankID).i8(value.ability).i8(value.moveset.length);
            for (const moveID of value.moveset) buffer.i8(moveID);
            buffer.i8(0);
        }

        this.manager.socket.send(buffer.out());
    }
};

module.exports = { IncomingMessageHandler, OutgoingMessageHandler };
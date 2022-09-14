const { IncomingMessageHandler } = require('./IncomingMessageHandler'),
    { Payloads: { Incoming, Outgoing } } = require('../enum/Payloads');

module.exports = class SocketManager {
    constructor(socket, request) {
        this.socket = socket, this.request = request;

        this.ip = request.headers['x-forwarded-for'].split(',').at(-1) || request.socket.remoteAddress;
        if (this.ip === '::1') console.log('Socket is connected to LOCALHOST.');

        this.messageHandler = new IncomingMessageHandler(this);
        this._attachHandlers();
    }

    _attachHandlers() {
        this.socket.on('message', function({ data }) {
            if (!Incoming[data[0]] && !Incoming[data[1]]) return this.socket.close(); // banning adding next
        });
    }
}
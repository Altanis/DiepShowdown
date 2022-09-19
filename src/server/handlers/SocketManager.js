const { IncomingMessageHandler, OutgoingMessageHandler } = require('./MessageHandler'),
    { Incoming } = require('../enum/Payloads'),
    { Reader } = require('./BinaryCoder');

module.exports = class SocketManager {
    constructor(server, socket, request) {
        // Antibotting measures:
        if (!request.headers.upgrade ||
            !request.headers.connection ||
            !request.headers.host ||
            !request.headers.pragma ||
            !request.headers["cache-control"] ||
            !request.headers["user-agent"] ||
            !request.headers["accept-encoding"] ||
            !request.headers["accept-language"]) return this.remove(true, 'Invalid request headers were sent during connection.');
        if (server.database.retreive('Ban', document => document.ip === socket.ip).length) return this.remove();

        this.server = server, this.socket = socket, this.request = request;

        this.user = null;
        this.lastMessageSent = 0;

        if (!socket.ip || socket.ip === '::1') (this.local = true, console.log('Socket is connected to LOCALHOST. Bans will not be administered.'));

        this.incomingMsgHandler = new IncomingMessageHandler(this),
            this.outgoingMsgHandler = new OutgoingMessageHandler(this);
        this._attachHandlers();
    }

    _attachHandlers() {
        this.socket.on('close', () => this.remove());

        this.socket.on('message', (data) => {
            console.log(data);

            if (!Incoming[data[0]]) return this.remove(true, 'Invalid packet header was sent during connection.');
            this.incomingMsgHandler[Incoming[data[0]]]?.(new Reader(data.slice(1)));
        });
    }

    remove(ban, reason) {
        console.log(`Socket is being ${ban ? 'banned' : 'disconnected'} for: ${reason || 'an unspecified reason.'}.`);
        (ban && !this.local) ? this.socket.terminate(reason) : this.socket.close();
        this.server.sockets.delete(this.socket);
    }

    tick(ticks) {} // idk what to put here yet
}
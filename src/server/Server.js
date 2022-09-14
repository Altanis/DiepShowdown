const { WebSocketServer: Server } = require('ws');

const { IncomingMessageHandler } = require('./handlers/IncomingMessageHandler'),
    { Payloads: { Incoming, Outgoing } } = require('./enum/Payloads');

const server = new Server({ port: 3000 });

server.on('listening', console.log('[WS] Running on PORT 3000.'));
server.on('error', console.error);
server.on('close', console.log('[WS] Server closed prematurely.'));

server.on('connection', function(socket, request) {
    socket.ip = request.headers['x-forwarded-for'].split(',').at(-1) || request.socket.remoteAddress;
});
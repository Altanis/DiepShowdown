const { WebSocketServer: Server } = require('ws'),
    URL = require('url');

const SocketManager = require('./handlers/SocketManager');

const server = new Server({ port: 3000 });
server.sockets = new Set();

server.on('listening', console.log('[WS] Running on PORT 3000.'));
server.on('error', console.error);
server.on('close', console.log('[WS] Server closed prematurely.'));

server.on('connection', function(socket, request) {
    server.sockets.add(new SocketManager(socket, request));
});
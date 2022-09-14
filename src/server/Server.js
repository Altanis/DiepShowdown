// Set up external database (MongoDB):
const mongoose = require('mongoose'),
    { Users, Ban } = require('./db/Schemas'),
    DBManager = require('./db/DBManager'); // A wrapper for Mongoose (which wraps around MongoDB lmao) because AFAIK mongoose doesn't do it's own caching.

mongoose.connect(process.env.MONGODB_URI)
    .then(console.log('[DB] Connected to MongoDB successfully.'))
    .catch(err => console.error('[DB] Failed to connect to MongoDB:', err));

const { WebSocketServer: Server } = require('ws'),
    URL = require('node:url');

const SocketManager = require('./handlers/SocketManager');

const server = new Server({ port: 3000 });
server.sockets = new Set();
server.database = new DBManager(300000);

server.on('listening', console.log('[WS] Running on PORT 3000.'));
server.on('error', console.error);
server.on('close', console.log('[WS] Server closed prematurely.'));

server.on('connection', function(socket, request) {
    // Attach things to socket 
    socket.terminate = function(reason) {
        server.database.create('Ban', { ip: socket.ip, reason });
        socket.close();
    };
    socket.

    server.sockets.add(new SocketManager(server, socket, request));
});
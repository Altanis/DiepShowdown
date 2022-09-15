require('dotenv').config();

// Set up external database (MongoDB):
const mongoose = require('mongoose'),
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

// Testing wrapper...
setTimeout(async () => {
    console.log('Testing wrapper...');
    await server.database.delete('Users', { username: 'oitanis' });
}, 5000);

server.on('listening', () => console.log('[WS] Running on PORT 3000.'));
server.on('close', () => console.log('[WS] Server closed prematurely.'));
server.on('error', console.error);

server.on('connection', function(socket, request) {
    // Attach things to socket 
    socket.terminate = function(reason) {
        server.database.create('Ban', { ip: socket.ip, reason });
        socket.close();
    };
    socket.ip = request.headers['x-forwarded-for'].split(',').at(-1) || request.address.remoteAddress;

    server.sockets.add(new SocketManager(server, socket, request));
});
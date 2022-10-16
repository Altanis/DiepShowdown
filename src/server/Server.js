require('dotenv').config();

// Set up external database (MongoDB):
const mongoose = require('mongoose'),
    DBManager = require('./db/DBManager'); // A wrapper for Mongoose (which wraps around MongoDB lmao) because AFAIK mongoose doesn't do it's own caching.

const { WebSocketServer: Server } = require('ws'),
    URL = require('node:url');

const BattleManager = require('./handlers/BattleManager'),
    SocketManager = require('./handlers/SocketManager');

mongoose.connect(process.env.MONGODB_URI)
    .then(console.log('[DB] Connected to MongoDB successfully.'))
    .catch(err => console.error('[DB] Failed to connect to MongoDB:', err));

// Editing internal object, deal with it. (realized .last would be useless, so I removed it)
/*Set = class extends Set {
    add(value) {
        super.add(value);
        this.last = value;
    }
}*/

const server = new Server({ port: 3000 });

server.ticks = 0;
server.sockets = new Set();

server.database = new DBManager(300000);

server.on('listening', () => {
    console.log('[WS] Running on PORT 3000.');

    // Server gametick loop
    setInterval(() => {
        server.ticks++;

        const socketsToBattle = [];
        for (const socket of server.sockets) { // Kill two birds with one stone.
            socket.tick(server.ticks); // Client may receive info of battle a tick later, should be fine.
            socket.waitingForBattle && socketsToBattle.push(socket);
        }
    
        if (socketsToBattle.length >= 2) {
            socketsToBattle.length % 2 && socketsToBattle.pop(); // Remove one if odd number of sockets.
            
            for (let i = 0; i < socketsToBattle.length; i++) {
                const players = [socketsToBattle[i], socketsToBattle[i + 1]];
    
                // TODO: Make BattleManager only instantiate once, not twice.
                players[0].waitingForBattle = players[1].waitingForBattle = false;
                players[0].battle = new BattleManager(server, players[0], players[1]);
                players[1].battle = new BattleManager(server, players[1], players[0]);
    
                players[0].outgoingMsgHandler.battle(players[1]);
                players[1].outgoingMsgHandler.battle(players[0]);
            }
        }
    }, 1000 / 5); // 5 TPS
});
server.on('close', () => console.log('[WS] Server closed prematurely.'));
server.on('error', console.error);

server.on('connection', function(socket, request) {
    // Attach things to socket 
    socket.terminate = function(reason) {
        if (socket.ip) server.database.create('Ban', { ip: socket.ip, reason });
        socket.close();
    };
    socket.ip = request.headers['x-forwarded-for']?.split(',').at(-1) || request.address?.remoteAddress;

    server.sockets.add(new SocketManager(server, socket, request));
});
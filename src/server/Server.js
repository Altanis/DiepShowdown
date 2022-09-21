require('dotenv').config();

// Set up external database (MongoDB):
const mongoose = require('mongoose'),
    DBManager = require('./db/DBManager'); // A wrapper for Mongoose (which wraps around MongoDB lmao) because AFAIK mongoose doesn't do it's own caching.

mongoose.connect(process.env.MONGODB_URI)
    .then(console.log('[DB] Connected to MongoDB successfully.'))
    .catch(err => console.error('[DB] Failed to connect to MongoDB:', err));


const { WebSocketServer: Server } = require('ws'),
    URL = require('node:url');

const BattleManager = require('./handlers/BattleManager'),
    SocketManager = require('./handlers/SocketManager');

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

server.on('listening', () => console.log('[WS] Running on PORT 3000.'));
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

setInterval(() => {
    server.ticks++;

    const socketsToBattle = [...server.sockets].filter(socket => socket.user && socket.waitingForBattle);
    
    if (socketsToBattle.length >= 2) {
        for (let i = 0; i < socketsToBattle.length; i++) {
            const players = [socketsToBattle[i], socketsToBattle[i + 1]];
            if (!players[1]) break;

            // [WARNING XD MOMENT XD WARNING WARRENING]: This is a very bad way of doing this, but it works for now.

            players[0].waitingForBattle = players[1].waitingForBattle = false;
            players[0].battle = new BattleManager(server, players[0], players[1]);
            players[1].battle = new BattleManager(server, players[1], players[0]);

            players[0].outgoingMsgHandler.battle(players[1]);
            players[1].outgoingMsgHandler.battle(players[0]);
        }
    }
    
    for (const socket of server.sockets) {
        socket.tick(server.ticks);
    }
}, 1000 / 5); // 5 TPS
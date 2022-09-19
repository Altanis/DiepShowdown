const Moves = require('../../data/Moves'),
    Tanks = require('../../data/Tanks');

module.exports = class BattleManager {
    constructor(server, player, opponent) {
        this.server = server;
        this.player = player;
        this.opponent = opponent;
    }

    send(tank) {
        tank = Tanks[tank];
    }
}
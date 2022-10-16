module.exports = class BattleManager {
    constructor(server, player, opponent) {
        this.server = server;
        this.player = player;
        this.opponent = opponent;

        if (!this.player.team) return this.player.remove(true, 'Attempted to battle without a team.');
        if (!this.opponent.team) return this.opponent.remove(true, 'Attempted to battle without a team.');
    }

    send(tankID) {
        if (!this.player.team[tankID]) return this.player.remove(true, 'Attempted to send an invalid tank.');
        
    }
}
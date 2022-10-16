module.exports = {
    Incoming: {
        0x00: 'login',
        0x01: 'chat',
        0x02: 'battle'
    }, 
    Outgoing: {
        0x00: 'antibot',
        0x01: 'accepted',
        0x02: 'error',
        0x03: 'chat',
        0x04: 'battle'
    },
    BannedWords: ['fag', 'faggot', 'nig', 'nigger', 'nigga', 'retard', 'chink', 'tranny'], // TODO: make a regexp for optimization
}
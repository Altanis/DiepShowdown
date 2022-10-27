// Man enum and interface would be amazing for these

module.exports = {
    // PACKETS
    Incoming: {
        0x00: 'login',
        0x01: 'chat',
        0x02: 'battle'
    }, 
    Outgoing: {
        0x00: 'antibot',
        0x01: 'accepted',
        0x02: 'notification',
        0x03: 'chat',
        0x04: 'battle'
    },
    
    // MISC
    NotificationTypes: {
        'error': [255, 0, 0],
        'success': [0, 255, 0],
        'info': [0, 0, 255],
        'warning': [255, 255, 0]       
    },
    BannedWords: ['fag', 'faggot', 'nig', 'nigger', 'nigga', 'retard', 'chink', 'tranny'], // TODO: make a regexp for optimization
}
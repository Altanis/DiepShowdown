const Moves = {
    1: {
        name: 'Protect',
        type: 'Status',
        description: 'Protects the user from a hit. Cannot be used twice in a row.',
        power: null,
        accuracy: 1,
        effects: {
            immunity: { rounds: 1 },
        }
    },
    2: {
        name: 'Decoy',
        type: 'Status',
        description: 'Creates a decoy using 25% of the user\'s max HP. Fails if user\'s HP is not greater than 25%.',
        power: null,
        accuracy: 1,
        effects: {
            recoil: {
                effect: 0.25,
                suicide: false,
            },
            decoy: { 
                hp: 0.25, 
            },
        },
    },
}

if (globalThis.process) module.exports = Moves;
else window.Moves = Moves;
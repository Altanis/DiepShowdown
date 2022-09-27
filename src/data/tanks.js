/**
* Stats:
*  - HP: Hit Points
*  - Res: Damage Resistance
*  - Dmg: Damage
*  - Pen: Penetration
*  - Acc: Accuracy
*  - ROF: Rate of Fire
*  - Reload: Reload Time
*  - Speed: Speed
*/

if (globalThis.process) {
    const Moves = require('./Moves');
    const Abilities = require('./Abilities');

    const MoveEnum = {};
    const AbilityEnum = {};
    
    for (const [key, value] of Object.entries(Moves)) MoveEnum[value.name] = key;
    for (const [key, value] of Object.entries(Abilities)) AbilityEnum[value.name] = key;
    
    const Tanks = {
        1: {
            name: 'Tank',
            tier: 1,
            types: ["Bullet"],
            ability: AbilityEnum.None,
            stats: {
                HP: 100,
                Resistance: 0,
                Damage: 10,
                Penetration: 0,
                Accuracy: 0.5,
                ROF: 1,
                Reload: 1,
                Speed: 1
            },
            moveset: [MoveEnum.Protect, MoveEnum.Decoy],
        }
    } 
    
    module.exports = Tanks;
} else {
    const MoveEnum = {};
    const AbilityEnum = {};

    for (const [key, value] of Object.entries(window.Moves)) MoveEnum[value.name] = key;
    for (const [key, value] of Object.entries(window.Abilities)) AbilityEnum[value.name] = key;

    const Tanks = {
        1: {
            name: 'Tank',
            tier: 1,
            types: ["Bullet"],
            ability: AbilityEnum.None,
            stats: {
                HP: 100,
                Resistance: 0,
                Damage: 10,
                Penetration: 0,
                Accuracy: 0.5,
                ROF: 1,
                Reload: 1,
                Speed: 1
            },
            moveset: [MoveEnum.Protect, MoveEnum.Decoy],
        }
    }

    window.Tanks = Tanks;
}
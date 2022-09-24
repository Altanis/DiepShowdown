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

const MoveToID = {
    Protect: 0,
    Decoy: 1,
}

const Tanks = {
    0: {
        name: 'Tank',
        tier: 1,
        types: ["Bullet"],
        ability: "N/A",
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
        moveset: [MoveToID.Protect, MoveToID.Decoy],
    }
}

if (globalThis.process) module.exports = Tanks;
else window.Tanks = Tanks;
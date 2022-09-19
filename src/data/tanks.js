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

const Tanks = {
    Tank: {
        Tier: 1,
        Types: ["Bullet"],
        Ability: "N/A",
        Stats: {
            HP: 100,
            Resistance: 0,
            Damage: 10,
            Penetration: 0,
            Accuracy: 0.5,
            ROF: 1,
            Reload: 1,
            Speed: 1
        },
        Moveset: [
            "Protect",
            "Decoy",
        ]
    }
}

if (globalThis.process) module.exports = Tanks;
else window.Tanks = Tanks;
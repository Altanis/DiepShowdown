const Tanks = {
    'Tank': {
        tier: 1,
        types: ['Bullet'],
    }
}

if (globalThis.process) module.exports = Tanks;
else window.Tanks = [];
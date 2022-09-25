const Abilities = {
    0: {
        name: 'None',
        effects: {}
    }
};

if (globalThis.process) module.exports = Abilities;
else window.Abilities = Abilities;
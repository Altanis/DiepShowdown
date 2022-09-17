const { Users, Ban } = require('./Schemas');

module.exports = class DBManager {
    #cache = { Users: [], Ban: [] };
    
    constructor(time) {
        this.#fetch();
        setInterval(() => {
            this.#fetch();
        }, time);
    }

    async #fetch() {
        this.#cache.Users = await Users.find();
        this.#cache.Ban = await Ban.find();
    }

    create(type, info) {
        return new Promise((resolve) => {
            if (type === 'Users') {
                new Users(info).save()
                    .then(document => {
                        this.#cache.Users.push(document);
                        resolve(document);
                    })
                    .catch(err => console.error('Could not save document for type USERS:', err));
            } else if (type === 'Ban') {
                new Users(info).save()
                    .then(document => {
                        this.#cache.Ban.push(document);
                        resolve(document);
                    })
                    .catch(err => console.error('Could not save document for type Ban:', err));
            }
        });
    }

    edit(type, filter, prop, value) {
        return new Promise(async (resolve) => {
            const cache = this.#cache[type];
            if (!cache) throw new Error(`[DB] Could not find type ${type}.`);
    
            const document = cache.find(filter);
            let realDoc;
    
            if (type === 'Users') realDoc = await Users.findOne({ username: document.username }) 
            else if (type === 'Ban') realDoc = await Ban.findOne({ ip: document.ip });
    
            realDoc[prop] = value, document[prop] = value;
            realDoc.save()
                .then(resolve)
                .catch(err => console.error('Could not modify document:', err))
        });
    }

    retreive(type, filter) {
        const cache = this.#cache[type];
        if (!cache) throw new Error(`[DB] Could not find type ${type}.`);
        return filter ? cache.filter(filter) : cache;
    }

    delete(type, filter) {
        return new Promise((resolve) => {
            let cache = this.#cache[type];
            if (!cache) throw new Error(`[DB] Could not find type ${type}.`);
    
            this.#cache[type] = cache.filter(document => {
                for (const [key, value] of Object.entries(filter)) {
                    if (document[key] === value) return false;
                }
            });
    
            if (type === 'Users') {
                Users.deleteMany(filter)
                    .then(resolve)
                    .catch(console.error);
            }
            else if (type === 'Ban') Ban.deleteMany(filter);
        });
    }
}
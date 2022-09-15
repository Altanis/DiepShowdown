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
        return new Promise((resolve, reject) => {
            if (type === 'Users') {
                new Users(info).save()
                    .then(document => {
                        this.#cache.Users.push(document);
                        resolve(document);
                    })
                    .catch(err => reject('Could not save document for type USERS:', err));
            } else if (type === 'Ban') {
                new Users(info).save()
                    .then(document => {
                        this.#cache.Ban.push(document);
                        resolve(document);
                    })
                    .catch(err => reject('Could not save document for type Ban:', err));
            }
        });
    }

    retreive(type, filter) {
        const cache = this.#cache[type];
        if (!cache) throw new Error(`[DB] Could not find type ${type}.`);
        return filter ? cache.filter(filter) : cache;
    }

    delete(type, filter) {
        let cache = this.#cache[type];
        if (!cache) throw new Error(`[DB] Could not find type ${type}.`);

        this.#cache[type] = cache.filter(document => {
            for (const [key, value] of Object.entries(filter)) {
                console.log(document, key, value);
                if (document[key] === value) return false;
            }
        });

        console.log(this.#cache);

        if (type === 'Users') {
            Users.deleteMany(filter)
                .then(console.log('done?'))
                .catch(console.error);
        }
        else if (type === 'Ban') Ban.deleteMany(filter);
    }
}
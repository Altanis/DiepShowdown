(() => {
    // -- MANMADE FUNCTIONS -- //
    const sanitizeHTML = function(str) {
        var temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };

    const enumerate = function(object) {
        Object.entries(object).forEach(([k, v]) => object[v] = k);
        return object;
    };

    // -- CACHED INTERNAL FUNCTIONS -- //
    const { getElementById } = document;

    class ElementManager {
        #views = enumerate({ 0: 'mainMenu', 1: 'allTeams', 2: 'teamBuild', 3: 'chooseTank', 4: 'tankBuild' });

        constructor(elements) {
            Object.entries(this.#views).forEach(([k, v]) => this.#views[k] = v);

            for (const name of elements) {
                this.#elements[name] = getElementById(name);
                if (this.#elements[name] === null) {
                    console.error(`[ELEMENT]: Could not find element with ID ${name}.`);
                    delete this.#elements[name];
                }
            };

            this.elements = {};
            this.view = 0;
        }

        changeView(view) {
            this.#elements[this.#views[this.view]].style.display = 'none';
            this.#elements[this.#views[view]].style.display = 'block';
            this.view = view;
        }
    }
    
    class Socket {
        constructor() {
            this.SERVER_URL = 'ws://localhost:3000/';
            this.io = new WebSocket(this.SERVER_URL);

            this.#attachEvents();
        }

        #attachEvents() {
            this.io.addEventListener("open", function() {
                console.log("[SOCKET]: Connected to server.");
            });
        }
    }    
})();
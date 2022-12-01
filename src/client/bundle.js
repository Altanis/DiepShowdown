(() => {
    // -- MODIFY PROTOTYPES -- //
    const { log: _log, warn: _warn, error: _error } = console;
    console.log = (...args) => _log(`%c[${new Date().toLocaleString()}] ${args.join(' ')}`, 'color: blue;');
    console.success = (...args) => _log(`%c[${new Date().toLocaleString()}] ${args.join(' ')}`, 'color: green;');
    console.error = (...args) => _error(`[${new Date().toLocaleString()}] ${args.join(' ')}`);
    console.warn = (...args) => _warn(`[${new Date().toLocaleString()}] ${args.join(' ')}`);
    console.debug = _log;

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
    // Cannot destructure due to illegal invocation
    const getElementById = id => document.getElementById(id); 
    const getItem = id => localStorage.getItem(id);
    const setItem = (id, value) => localStorage.setItem(id, value);
    const removeItem = id => localStorage.removeItem(id);

    const TeamRenderer = class { // As opposed to TeamManager, this renders teams instead of saving them.
        
        /** U P L O A D  T A N K S */
        #createListElement({ name, sprite }) {
            const li = document.createElement('li');
            li.classList.add('li');

            const img = document.createElement('img');
            img.src = `img/svgs/tanks.svg#${sprite}`;
            img.width = 50;
            img.height = 50;

            const span = document.createElement('span');
            span.classList.add('name');
            span.textContent = name;

            li.appendChild(img);
            li.appendChild(span);

            return li;
        }

        #uploadMoves() {
            const { name, sprite, moveset } = tank;
            for (const id of moveset) {
                // INCOMPLETE!!!!!
            }
        }

        #handleClick(id, tank) {
            const { tankSprite, movesetContainer } = player.elements;

            const currTank = player.TeamManger.currentTeam[id] = {
                moveset: [],
                level: 100,
                nickname: ''
            };

            movesetContainer.innerHTML = '';
            player.view++;

            // handle nickname
            tankSprite.src = `img/svgs/tanks.svg#${tank.sprite}`;

            this.#uploadMoves(tank);
        }

        #render() {
            for (const [id, tank] of Object.entries(window.Tanks)) {
                const li = this.#createListElement(tank);
                li.addEventListener('click', this.#handleClick(id, tank));
            }
        }

        uploadTanks() {
            // TOOD: Make this more OOP-based and remove functional patterns
            // -- DYNAMICALLY UPLOAD TANKS -- //
            for (const [id, tank] of Object.entries(window.Tanks)) {
                li.addEventListener('click', () => {
                    const currTank = player.TeamManger.currentTeam[id] = {
                        moveset: [],
                        level: 100,
                        nickname: '',
                    };
                    
                    movesetContainer.innerHTML = '';
                    player.view++;

                    // tankNickname.placeholder = name;
                    tankSprite.src = `img/svgs/tanks.svg#${sprite}`;

                    // TODO: make more OOP-based
                    for (const id of moveset) {
                        const move = window.Moves[id];

                        const li = document.createElement('li');
                        li.style.display = "flex";
                        li.style.width = li.style.height = "auto";

                        const movname = document.createElement('p');
                        const movecat = document.createElement('p');
                        const movpower = document.createElement('p');
                        const movdesc = document.createElement('p');

                        movname.textContent = move.name;
                        movecat.textContent = move.type;
                        movpower.textContent = move.power || '--';
                        movdesc.textContent = move.description;

                        movname.classList.add("col", "movname");
                        movecat.classList.add("col", "movecat");
                        movpower.classList.add("col", "movpower");
                        movdesc.classList.add("col", "movdesc");

                        li.appendChild(movname);
                        li.appendChild(movecat);
                        li.appendChild(movpower);
                        li.appendChild(movdesc);

                        for (let i = 5; i-- > 1;) {
                            const input = player.elements[`move${i}`];
                            input.addEventListener('input', event => {
                                currTank.moveset[i - 1] = null;

                                const content = event.target.value.toLowerCase().replaceAll(' ', '');
                                if (content) {
                                    for (const child of movesetContainer.children) {
                                        child.style.display = child.children[0].innerText.toLowerCase().replaceAll(' ', '').includes(content) ? 'flex' : 'none'; 
                                    }
                                } else {
                                    for (const child of movesetContainer.children) child.style.display = 'flex';
                                }
                            });
                        }

                        li.addEventListener('click', () => {
                            const idx = currTank.moveset.indexOf(null) + 1 || currTank.moveset.push(+id);
                            player.elements[`move${idx}`].value = move.name;
                            currTank.moveset[idx - 1] = +id; // ensurance in the event moveset[idx - 1] === null
                            player.TeamManger.save();
                            for (const child of movesetContainer.children) child.style.display = "flex";
                        });

                        movesetContainer.appendChild(li);
                    }
                });

                tanks.appendChild(li);
            }
        }

        uploadTeams() {
            const teamContainer = player.elements.teamContainer;
            teamContainer.innerHTML = '';

            for (const [id, team] of Object.entries(player.TeamManger.teams)) {
                const li = document.createElement('li');
                li.classList.add('li');

                const span = document.createElement('span');
                span.classList.add('name');
                span.textContent = id;

                li.appendChild(span);
                li.addEventListener('click', () => {
                    player.TeamManger.pointer = id;
                    player.view++;
                });

                teamContainer.appendChild(li);
            }
        }
    }

    const ElementManager = class {
        #views = enumerate({ 0: 'mainMenu', 1: 'allTeams', 2: 'teamBuild', 3: 'chooseTank', 4: 'tankBuild' });

        constructor(elements) {
            this.elements = {};

            this._view = 0;
            Object.defineProperty(this, 'view', {
                get() { return this._view; },
                set(v) { 
                    this.changeView(v);
                    this._view = v; 
                }
            });

            this.initialize(elements);
            this.uploadTanks();
        }

        initialize(elements) {
            for (let info of elements) {
                if (typeof info === 'string') info = { name: info };

                const element = getElementById(info.name) || window[info.name];
                if (!element) {
                    console.error(`[ELEMENT]: Could not find element with ID ${info.name}.`);
                    continue;
                }

                this.elements[info.name] = element;

                for (const [k, cb] of Object.entries(info)) {
                    if (typeof cb !== 'function') continue;
                    
                    if (k === 'ready') { 
                        cb.bind(this)();
                        continue;
                    }

                    this.elements[info.name].addEventListener(k, cb.bind(this));
                }
            };
        }

        changeView(view) {
            // TODO: Remove bandaid and make real solution
            // this.elements.movesetWrapper.style.display = view === 4 ? 'block' : 'none';

            this.elements[this.#views[this.view]].style.display = 'none';
            this.elements[this.#views[view]].style.display = 'block';

            if (!view) {
                this.elements.mainMenu.style.display = 'block';
                this.elements.teamBuilder.style.display = 'none';
            } else {
                this.elements.mainMenu.style.display = 'none';
                this.elements.teamBuilder.style.display = 'block';
            }
        }
    }

    const Animations = class {}; // When battles are worked on, this will manage HTMLCanvas2D animations.

    const Player = class {
        constructor() {
            // -- ELEMENTS -- //
            this.elements = new ElementManager([
                // GLOBALS
                {
                    name: 'document',
                    keydown(event) {
                        if (event.code === 'Enter') {
                            player.accountAction(null, null, true);
                            player.chatAction();
                        }
                    }
                },
                
                // ALL VIEWS
                'mainMenu',
                'teamBuilder', // PSUEDO-VIEW: WRAPS ALL TEAM BUILDER ELEMENTS
                'allTeams',
                'teamBuild',
                'chooseTank',
                'tankBuild',

                // VIEW 0
                'username', // INPUT: The username of the player.
                'password', // INPUT: The password of the player.
                'trainerID', // TRAINERCARD_INFO: The trainer ID of the player. 
                'hoursPlayed', // TRAINERCARD_INFO: The hours the player has played.
                'joinDate', // TRAINERCARD_INFO: The date the player joined.
                'playerAvatar', // TRAINERCARD_INFO: The avatar of the player.
                'elo', // TRAINERCARD_INFO: The ELO of the player.
                'chat', // DIV: The chat for the application; all sent messages go here.
                'chatBox', // INPUT: Where the client types and sends their messages.
                'changeUsername', // INPUT: The changed username of the player.
                'changePassword', // INPUT: The changed password of the player.
                'placeholder', // Placeholder for "Please log in to see your trainer card."
                'usernameInfo', // TRAINERCARD_INFO: The username of the player.
                'trainerID', // TRAINERCARD_INFO: The trainer ID of the player.
                'hoursPlayed', // TRAINERCARD_INFO: The hours the player has played.
                'joinDate', // TRAINERCARD_INFO: The date the player joined.
                'playerAvatar', // TRAINERCARD_INFO: The avatar of the player.
                'elo', // TRAINERCARD_INFO: The ELO of the player.
                'picker', // DIV: The div that holds the color picker.
                'colorpicker', // INPUT: The color picker for the client.
                'modal', // The modal for connection state.

                { 
                    name: 'login', // BUTTON: The button to log in.
                    click() {
                        player.accountAction(+!player.loggedIn); // If not logged in, log in (+!false = 1), else log out (+!true = 0).
                    } 
                }, // BUTTON: The button to login.
                { name: 'register', click() { player.accountAction(2); } }, // BUTTON: The button to register.
                { name: 'changeUN', click() { player.accountAction(3, 2); } }, // BUTTON: The button to change username.
                { name: 'changePW', click() { player.accountAction(3, 3); } }, // BUTTON: The button to change password.
                { 
                    name: 'changeColor', 
                    click() {
                        if (!player.loggedIn) return;

                        const { changeColor } = this.elements;
                        if (changeColor.innerText === 'Change Color') {
                            this.elements.picker.style.display = 'block';
                            changeColor.innerText = 'Confirm';
                        } else {
                            this.elements.picker.style.display = 'none';
                            changeColor.innerText = 'Change Color';
                            player.accountAction(3, 1);
                        }
                    }
                }, // BUTTON: The button to change the client's color.
                {
                    name: 'overlay', // The gray overlay behind the modal.
                    ready() {
                        if (getItem('noOverlay')) this.elements.overlay.style.display = 'none';
                    }
                },

                // VIEW 1
                'teamContainer', // DIV: The div that holds all the teams.

                // VIEW 2
                'tanks', // DIV: The div that holds all the tanks.

                // VIEW 3
                'tankSprite', // The sprite of the tank selected.
                'movesetWrapper', // Div which provides wrapping.
                'movesetContainer', // The container for the moveset.
                // INPUTS: Inputs for the movesets.
                'move1',
                'move2',
                'move3',
                'move4',

                // View Support Buttons
                { 
                    name: 'teambuilder',
                     click() {
                        this.uploadTeams();
                        this.view++; 
                    } 
                }, // Teambuilder Button
                { 
                    name: 'createTeam', 
                    click() { 
                        this.view++;
                        player.TeamManger.teams[player.TeamManger.pointer = Date.now()] = {};
                        player.TeamManger.save();
                    }
                }, // Create Team Button
                { name: 'addTank', click() { this.view++; player.TeamManger.save(); } }, // Add Tank Button
                { name: 'allTeamsBack', click() { this.view--; player.TeamManger.save(); } }, // All Teams Back Button
                { name: 'teamBuildBack', click() { this.view--; player.TeamManger.save(); } }, // Team Build Back Button
                { name: 'chooseTankBack', click() { this.view--; player.TeamManger.save(); } }, // Choose Tank Back Button
                { name: 'tankBuildBack', click() { this.view--; player.TeamManger.save(); } }, // Tank Build Back Button
            ]).elements;

            // -- SOCKET -- //
            this.SERVER_URL = "ws://localhost:3000/";
            this.io = new WebSocket(this.SERVER_URL);
            this.io.binaryType = "arraybuffer";

            // -- PLAYER DATA -- //
            this.card = {};
            this.loggedIn = false;
            this.color = getItem('color') || '#000000';

            // -- TEAM DATA -- //
            this.TeamManger = {
                teams: getItem('teams') ? JSON.parse(getItem('teams')) : {},
                pointer: null,
                get currentTeam() {
                    return this.teams[this.pointer] || {};
                },
                save() {
                    setItem('teams', JSON.stringify(this.teams));
                },
            };

            this.TeamManger.pointer = Object.keys(this.TeamManger.teams)[0] || null;

            this.#attachEvents();
        }

        chatAction() {
            if (document.activeElement !== this.elements.chatBox || !this.elements.chatBox.value) return;

            this.io.send(new Writer().i8(1).string(this.elements.chatBox.value).out());
            this.elements.chatBox.value = '';
        }

        accountAction(code, type, pressedEnter) {
            if (![this.elements.username, this.elements.password].includes(document.activeElement) && pressedEnter && code === null) return;
            if ([this.elements.username, this.elements.password].includes(document.activeElement) && pressedEnter) code = 1;

            if (!code) {
                this.loggedIn = false;
                removeItem('username');
                removeItem('password');
                this.elements.picker.style.display = 'block';
                this.elements.login.innerText = 'Log In';
                return this.io.close();
            }

            code -= 1;

            const buffer = new Writer().i8(0x00).i8(code);

            switch (code) {
                case 0: { // Login
                    setItem('username', this.elements.username.value);
                    setItem('password', this.elements.password.value);

                    buffer.string(this.elements.username.value).string(this.elements.password.value);
                    break;
                }
                case 1: { // Register
                    setItem('username', this.elements.username.value);
                    setItem('password', this.elements.password.value);

                    buffer.string(this.elements.username.value).string(this.elements.password.value).i8(1);
                    this.elements.colorpicker.value.slice(1).split(/(?<=^(?:.{2})+)(?!$)/).forEach(hex => buffer.i8(parseInt(hex, 16))); 
                    break;
                }
                case 2: { // Change Profile
                    switch (type) {
                        case 0: buffer.i8(0).i8(1); break; // Change Avatar
                        case 1: {
                            setItem('color', this.elements.colorpicker.value);
                            buffer.i8(1);
                            this.elements.colorpicker.value.slice(1).split(/(?<=^(?:.{2})+)(?!$)/).forEach(hex => buffer.i8(parseInt(hex, 16))); // Change Color
                            break;
                        }
                        case 2: {
                            setItem('username', this.elements.changeUsername.value);
                            buffer.i8(2).string(this.elements.changeUsername.value); // Change Username
                            break;
                        }
                        case 3: {
                            setItem('password', this.elements.changePassword.value);
                            buffer.i8(3).string(this.elements.changePassword.value); // Change Password
                            break;
                        }
                    }
                    break;
                }
            }

            this.io.send(buffer.out());
            
            /*const packet = new Writer()
                .i8(0x00) // LOGIN Packet
                .i8(code - 1) // TYPE: 0 = Login, 1 = Register, 2 = Change Profile
                .string(getItem('username'))
                .string(`${getItem('password')}${code === 3 ? ` + ${this.elements.changePassword.value}` : ''}`); 
            
            if (code === 2) {
                switch (type) {
                    case 'avatar': break; // avatar isn't changable yet
                    case 'color': this.elements.colorpicker.value.slice(1).split(/(?<=^(?:.{2})+)(?!$)/).forEach(hex => packet.i8(parseInt(hex, 16))); break;
                    case 'password': packet.string(this.elements.changePassword.value); break;
                }
            }

            /*if (code === 2 || code === 4) this.elements.colorpicker.value.slice(1).split(/(?<=^(?:.{2})+)(?!$)/).forEach(hex => packet.i8(parseInt(hex, 16))); // REGISTER / CHANGE COLOR
            else if (code === 3) setItem('password', this.elements.changePassword.value); // CHANGE PASSWORD

            if (code !== 4) { // <- Change Color, doesn't require logging in again (as long as the WS conneciton has a user).
                setItem('username', this.elements.username.value);
                setItem('password', this.elements.password.value);
                setItem('color', this.elements.colorpicker.value);
            }

            if (getItem('username') && getItem('password')) this.io.send(packet.out());*/
        }

        #attachEvents() {
            this.io.addEventListener("open", () => {
                console.success("[SOCKET]: Connected to server.");
                this.elements.overlay.style.display = 'none';

                if (getItem('username') && getItem('password')) {
                    this.io.send(new Writer().i8(0x00).i8(0).string(localStorage.username).string(localStorage.password).out());
                }
            });

            this.io.addEventListener("error", () => console.error(`[SOCKET]: Error during connection has occured.`));
            this.io.addEventListener("close", () => {
                console.log("[SOCKET]: Connection to server has been closed.");
                if (getItem('noOverlay')) return;

                this.elements.overlay.style.display = '';
                this.elements.modal.innerHTML = `
                <p style="color: red; font-size: 48px;">💀Disconnected💀</p>
                <p style="color: red; font-size: 24px;">The server may be down, you have no connection, or you went AFK.</p>
                `;
            });

            this.io.addEventListener("message", ({ data }) => {
                _log(new Uint8Array(data));
                data = new Reader(new Uint8Array(data));

                switch (data.i8()) {
                    case 0x00: return; // ANTIBOT Packet, not in production.
                    case 0x01: { // ACCEPTED Packet, sent when the server accepts the client's login request.
                        this.card.trainerID = data.string();
                        this.card.hoursPlayed = data.f32();
                        this.card.joinDate = data.string();
                        this.card.playerAvatar = Tanks[data.i8()].sprite;
                        this.card.elo = data.f32();
                        this.loggedIn = true;

                        const { chatBox, placeholder, picker, login } = this.elements;

                        chatBox.disabled = false;
                        chatBox.placeholder = 'Type a message...';
                        placeholder.style.display = 'none';
                        picker.style.display = 'none';
                        login.innerText = 'Log Out';

                        this.elements.usernameInfo.innerText = `Username: ${getItem('username')}`;
                        this.elements.trainerID.innerText = `Trainer ID: ${this.card.trainerID}`;
                        this.elements.hoursPlayed.innerText = `Hours Online: ${this.card.hoursPlayed}`;
                        this.elements.joinDate.innerText = `Join Date: ${this.card.joinDate}`;
                        this.elements.playerAvatar.style.display = '';
                        this.elements.playerAvatar.src = `img/svgs/tanks.svg#${this.card.playerAvatar.toLowerCase()}`;
                        this.elements.elo.innerText = `ELO: ${this.card.elo}`;

                        return;
                    }
                    case 0x02: { // ERROR Packet, signifies when an error has occured.
                        return alert(data.string()); // Will make an error box later.
                    }
                    case 0x03: { // CHAT Packet, sent when a message is sent to the global chat.
                        const username = data.string();
                        const [r, g, b] = [data.i8(), data.i8(), data.i8()];
                        const content = data.string();

                        const { chat } = this.elements;
                        chat.innerHTML += `<div class="padding: 5px;"><b style="color: rgb(${r}, ${g}, ${b});">${sanitizeHTML(username)}:</b> ${sanitizeHTML(content)}</div>`;
                        chat.scrollTop = chat.scrollHeight;
                        return;                    
                    }
                    case 0x04: { // BATTLE packet
                        const opponentTeam = {};

                        const teamLength = data.i8();
                        while (teamLength--) {
                            const tankID = data.i8(),
                                abilityID = data.i8(),
                                movesetLength = data.i8(); 
        
                            opponentTeam[tankID] = { ability: abilityID, moveset: [] };
        
                            while (movesetLength--) {
                                const moveID = data.i8();
                                opponentTeam[tankID].moveset.push(moveID);
                            }
                        }
                    }
                }
            });
        }
    }

    const player = new Player();
})();
(() => {
    const windowPointer = globalThis;
    windowPointer.scriptLoaded = 1;
    
    const sanitizeHTML = function(str) {
        var temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };
    const SERVER_URL = 'ws://localhost:3000/';
    let loggedIn = false, playerData = {};
    
    // -- CACHED INTERNAL FUNCTIONS -- //
        
    // -- ELEMENTS -- //
    
    // Views
    const MainMenu = document.getElementById('mainMenu'),
        TeamBuilder = document.getElementById('teamBuilder');
    
    // Main Menu:
        // Column 1
        const teamSelector = document.getElementById('teamSelector'),
            battle = document.getElementById('battle'),
            teamBuilder = document.getElementById('teambuilder');
        // Column 2
        const username = document.getElementById('username'),
            password = document.getElementById('password'),
            changePassword = document.getElementById('changePassword'),
            login = document.getElementById('login'),
            register = document.getElementById('register'),
            changePW = document.getElementById('changePW'),
            picker = document.getElementById('picker'),
            colorPicker = document.getElementById('colorpicker');
        // Column 3
        const globalChat = document.getElementById('chat'),
            chatBox = document.getElementById('chatBox');

        // Trainer Card
        const trainerID = document.getElementById('trainerID'),
            hoursPlayed = document.getElementById('hoursPlayed'),
            joinDate = document.getElementById('joinDate'),
            playerAvatar = document.getElementById('playerAvatar'),
            elo = document.getElementById('elo');

    // Team Builder:
        const allTeams = document.getElementById('allTeams'),
            teamBuild = document.getElementById('teamBuild'),
            back = document.getElementById('back'), 
            createTeam = document.getElementById('createTeam'),
            addTank = document.getElementById('addTank'),
            currentTanks = document.getElementById('currentTanks'),
            allTanks = document.getElementById('allTanks'),
            tanks = document.getElementById('tanks');

    // -- UPLOAD IMAGES -- //
    for (const tank of Object.values(window.Tanks)) {
        const { name } = tank; // More will be referenced as time comes.

        const li = document.createElement('li');
        li.classList.add('li');

        const img = document.createElement('img');
        img.src = `img/assets/tanks/${name.toLowerCase()}.png`;
        img.classList.add('img-tiny');

        const span = document.createElement('span');
        span.classList.add('name');
        span.textContent = name;

        li.appendChild(img);
        li.appendChild(span);

        tanks.appendChild(li);
    }

    // -- FUNCTIONS -- //
    function accountAction(type, pressedEnter) {
        if (![username, password].includes(document.activeElement) && pressedEnter) return;

        localStorage.username = username.value,
            localStorage.password = password.value;

        const packet = new Writer()
            .i8(0x00)
            .string(localStorage.username)
            .string(`${localStorage.password}${type === 2 && changePassword.value ? ` + ${changePassword.value}` : ''}`)
            .i8(type);
        if (type === 1) {
            colorPicker.value.slice(1).split(/(?<=^(?:.{2})+)(?!$)/).forEach(hex => packet.i8(parseInt(hex, 16)));
        }

        (localStorage.username && localStorage.password)
            && socket.send(packet.out());
    }

    function chatAction() {
        if (document.activeElement !== chatBox || !chatBox.value) return;

        socket.send(new Writer().i8(0x01).string(chatBox.value).out());
        chatBox.value = '';
    }

    document.addEventListener('keydown', function(event) {
        switch (event.code) {
            case 'Enter': {
                accountAction(0, true);
                chatAction();
                break;
            }
        }
    });

    localStorage.noOverlay && (document.getElementById('overlay').style.display = 'none');

    login.onclick = () => loggedIn ? (loggedIn = false, delete localStorage.username, delete localStorage.password, picker.style.display = 'block', login.innerText = 'Log In', socket.close()) : accountAction(0);
    register.onclick = () => accountAction(1);
    changePW.onclick = () => accountAction(2);
    
    teamBuilder.onclick = () => (MainMenu.style.display = 'none', TeamBuilder.style.display = 'block');
    back.onclick = () => (MainMenu.style.display = 'block', TeamBuilder.style.display = 'none');

    createTeam.onclick = () => allTeams.style.display === 'block' ? 
    (allTeams.style.display = 'none', teamBuild.style.display = 'block', back.style.display = 'none', createTeam.innerHTML = '<i class="material-icons">&#xe317;</i> Back') 
    : (allTeams.style.display = 'block', teamBuild.style.display = 'none', back.style.display = 'block', allTanks.style.display = 'none', createTeam.innerHTML = '<i class="material-icons">&#xe147;</i> New Team');

    addTank.onclick = () => (allTanks.style.display = 'block', createTeam.style.display = 'block', currentTanks.style.display = 'none');

    const socket = new WebSocket(SERVER_URL);
    socket.binaryType = 'arraybuffer';
    socket.addEventListener('error', console.error);
    socket.addEventListener('close', () => {
        console.log('Socket closed prematurely.');
        if (localStorage.noOverlay) return;
        document.getElementById('overlay').style.display = '';
        document.getElementById('modal').innerHTML = `
        <p style="color: red; font-size: 48px;">💀Disconnected💀</p>
        <p style="color: red; font-size: 24px;">The server may be down, you have no connection, or you went AFK.</p>
        `;
    });
    socket.addEventListener('open', () => {
        document.getElementById('overlay').style.display = 'none';
        if (localStorage.username && localStorage.password) {
            socket.send(new Writer().i8(0x00).string(localStorage.username).string(localStorage.password).i8(0).out());
        }
    });
    socket.addEventListener('message', ({ data }) => {
        console.log(new Uint8Array(data));
        data = new Reader(new Uint8Array(data));

        switch (data.i8()) {
            case 0x00: { break; } // ANTIBOT Packet, not in effect.
            case 0x01: { // ACCEPTED Packet, login was accepted.
                playerData = {
                    trainerID: data.string(),
                    hoursPlayed: data.f32(),
                    joinDate: data.string(),
                    avatar: data.string(),
                    elo: data.f32(),
                };

                loggedIn = true;

                chatBox.disabled = false;
                chatBox.placeholder = 'Send a message...';

                document.getElementById('placeholder').style.display = 'none';
                picker.style.display = 'none';

                login.innerText = 'Log Out';

                document.getElementById('usernameInfo').innerText = 'Username: ' + localStorage.username;
                trainerID.innerText = 'Trainer ID: ' + playerData.trainerID;
                hoursPlayed.innerText = 'Hours Online: ' + playerData.hoursPlayed;
                joinDate.innerText = 'Joined At: ' + playerData.joinDate;
                playerAvatar.src = `img/assets/tanks/large/blue/${playerData.avatar?.toLowerCase()}.png`;
                elo.innerText = 'ELO: ' + playerData.elo;

                playerAvatar.style.display = 'block';
                break;
            }
            case 0x02: { // ERROR Packet, signifies when an error occurs.
                const error = data.string();
                alert(error);
                break;
            }
            case 0x03: {
                const username = data.string(),
                    [r, g, b] = [data.i8(), data.i8(), data.i8()],
                    content = data.string();

                globalChat.innerHTML += `<div class="padding: 5px;"><b style="color: rgba(${r}, ${g}, ${b});">${sanitizeHTML(username)}:</b> ${sanitizeHTML(content)}</div>`;
                globalChat.scrollTop = globalChat.scrollHeight;
                break;
            }
            case 0x04: {
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
            
                break;
            }
        }
    });
})();
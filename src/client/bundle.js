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
        const teamBuilder = document.getElementById('teambuilder');
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
            allTeamsBack = document.getElementById('allTeamsBack'), 
            teamBuildBack = document.getElementById('teamBuildBack'),
            chooseTankBack = document.getElementById('chooseTankBack'),
            tankBuildBack = document.getElementById('tankBuildBack'),
            createTeam = document.getElementById('createTeam'),
            addTank = document.getElementById('addTank'),
            chooseTank = document.getElementById('chooseTank'),
            tanks = document.getElementById('tanks'),
            tankBuild = document.getElementById('tankBuild');

        const tankSprite = document.getElementById('tankSprite'),
            tankMoveset = document.getElementById('tankMoveset');

    // -- UPLOAD IMAGES -- //
    for (const tank of Object.values(window.Tanks)) {
        const { name, sprite } = tank; // More will be referenced as time comes.

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
        li.onclick = function() {
            tankBuild.style.display = 'block';
            chooseTank.style.display = 'none';

            // tankNickname.placeholder = name;
            tankSprite.src = `img/svgs/tanks.svg#${sprite}`;

            for (const element of document.getElementsByClassName('move')) {
                element.onfocus = () => moveset.style.display = 'inline-block';
                element.onblur = () => moveset.style.display = 'none';
            }
        };

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

        if (type === 1) colorPicker.value.slice(1).split(/(?<=^(?:.{2})+)(?!$)/).forEach(hex => packet.i8(parseInt(hex, 16)));

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
    createTeam.onclick = () => (allTeams.style.display = 'none', teamBuild.style.display = 'block');
    addTank.onclick = () => (chooseTank.style.display = 'block', teamBuild.style.display = 'none');
    
    allTeamsBack.onclick = () => (MainMenu.style.display = 'block', TeamBuilder.style.display = 'none');
    teamBuildBack.onclick = () => (allTeams.style.display = 'block', teamBuild.style.display = 'none');
    chooseTankBack.onclick = () => (chooseTank.style.display = 'none', teamBuild.style.display = 'block');
    tankBuildBack.onclick = () => (chooseTank.style.display = 'block', tankBuild.style.display = 'none');

    // -- SOCKET -- //
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
                playerAvatar.src = `img/svgs/tanks.svg#${playerData.avatar.toLowerCase()}`;
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
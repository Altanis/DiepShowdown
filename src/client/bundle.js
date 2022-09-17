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
    const MainMenu = document.getElementById('mainMenu');
    
    // Column 1
    const format = document.getElementById('formatSelector'),
        teamSelector = document.getElementById('teamSelector'),
        battle = document.getElementById('battle');
    // Column 2
    const username = document.getElementById('username'),
        password = document.getElementById('password'),
        changePassword = document.getElementById('changePassword'),
        login = document.getElementById('login'),
        register = document.getElementById('register'),
        changePW = document.getElementById('changePW');
    // Column 3
    const globalChat = document.getElementById('chat'),
        chatBox = document.getElementById('chatBox');

    // Trainer Card
    const trainerID = document.getElementById('trainerID'),
        hoursPlayed = document.getElementById('hoursPlayed'),
        joinDate = document.getElementById('joinDate'),
        playerAvatar = document.getElementById('playerAvatar'),
        elo = document.getElementById('elo');

    // -- FUNCTIONS -- //
    function accountAction(type, pressedEnter) {
        if (![username, password].includes(document.activeElement) && pressedEnter) return;

        localStorage.username = username.value,
            localStorage.password = password.value;

        (localStorage.username && localStorage.password) && 
            socket.send(new Writer()
            .i8(0x00)
            .string(localStorage.username)
            .string(`${localStorage.password}${type === 2 && changePassword.value ? ` + ${changePassword.value}` : ''}`)
            .i8(type)
            .out());
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

    login.onclick = () => accountAction(0);
    register.onclick = () => accountAction(1);
    changePW.onclick = () => accountAction(2);

    const socket = new WebSocket(SERVER_URL);
    socket.binaryType = 'arraybuffer';
    socket.addEventListener('error', console.error);
    socket.addEventListener('close', () => console.log('Socket closed prematurely.'));
    socket.addEventListener('open', () => {
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
                } 

                console.log(playerData.avatar);

                loggedIn = true;

                chatBox.disabled = false;
                chatBox.placeholder = 'Send a message...';

                document.getElementById('placeholder').style.display = 'none';

                trainerID.innerText = 'Trainer ID: ' + playerData.trainerID;
                hoursPlayed.innerText = 'Hours Online: ' + playerData.hoursPlayed;
                joinDate.innerText = 'Joined At: ' + playerData.joinDate;
                playerAvatar.src = `img/avatars/${playerData.avatar}.png`;
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
                    content = data.string();

                globalChat.innerHTML += `<b>${sanitizeHTML(username)}:</b> ${sanitizeHTML(content)}`;
                globalChat.scrollTop = globalChat.scrollHeight;
            }
        }
    });
})();
(() => {
    const windowPointer = globalThis;
    windowPointer.scriptLoaded = 1;
    
    const SERVER_URL = 'ws://localhost:3000/';

    let loggedIn = false;
    
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
        login = document.getElementById('login'),
        register = document.getElementById('register'),
        changePW = document.getElementById('changePW');
    // Column 3
    const globalChat = document.getElementById('chat'),
        chatBox = document.getElementById('chatBox');
    
    const socket = new WebSocket(SERVER_URL);
    socket.binaryType = 'arraybuffer';
    socket.addEventListener('error', console.error);
    socket.addEventListener('close', () => console.log('Socket closed prematurely.'));
    socket.addEventListener('open', () => {
        if (localStorage.username && localStorage.password) {
            socket.send(new Uint8Array([
                0x00, 
                ...new TextEncoder(localStorage.username).encode(), 
                ...new TextEncoder(localStorage.password).encode(),
                0,
            ]));
        }
    });
    socket.addEventListener('message', ({ data }) => {
        switch (data[0]) {
            case 0x00: { break; } // ANTIBOT Packet, not in effect.
            case 0x01: { // ACCEPTED Packet, login was accepted.
                loggedIn = true;

                chatBox.disabled = false;
                chatBox.placeholder = 'Send a message...';
                break;
            }
        }
    });
})();
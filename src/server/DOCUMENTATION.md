# DiepShowdown API Documentation

The server runs with Node.js as a WebSocket server using the `ws` NPM module. Every request to the server must be sent as a packet.

## Serverbound Packets
### **`0x00: Login Packet`**
This packet tells the server to handle with a login request. Three different types can be specified in the second byte of the packet.

The three different types are:
- `0x0: LOGIN`: This packet tells the server that the user wants to log in. Format: `[0x0, i8(0x0)  string(username), string(password)]`
- `0x1: REGISTER`: This packet tells the server that the user wants to create an account. Format: `[0x0, i8(0x1), string(username), string(password), string(avatar), ...array(3)[i8(rgb)]]`
- `0x2: CHANGE_PROFILE` This packet tells the server that the client wants to modify their profile (i.e. change avatar/color). Format: `[0x0, i8(0x3), type(0x0 || 0x1)]`

-> Note: 0x0 represents changing avatar, 0x1 represents changing color, 0x2 represents changing username, 0x3 represents changing password.
### **`0x01: Chat Packet`**
This packet tells the server that the client wants to send a message in the global chat.
Format: `[0x1, string(content)]`

### **`0x02: Battle`**
This packet tells the server  that the client wants to battle another player.
Format: `[0x2, ...array(6)[ i8(tankID), i8(abilityID), ...array(4)[ i8(moveID) ] ], ]`

## Clientbound Packets
Detailed information on clientbound packets coming soon™.
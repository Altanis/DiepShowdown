// Start the client:
const http = require('node:http');
const fs = require('node:fs');

// Load all files:
const files = {
    // Frontend files
    'src/client/index.html': null,
    'src/client/bundle.js': null,
    'src/client/style.css': null,
    'src/client/bincoder.js': null,
    'src/client/img/favicon.png': null,
    'src/client/img/background.png': null,

    // SVGs:
    'src/client/img/svgs/tanks.svg': null,

    // Data files
    'src/data/Abilities.js': null,
    'src/data/Tanks.js': null,
    'src/data/Moves.js': null,
};

console.log('DiepShowdown: LOADING...');
console.log('===============');

for (let [file] of Object.entries(files)) {
    const data = fs.readFileSync(file);
    if (file.endsWith('.svg')) file = file.replace('client/', '');

    files[file] = data;
    console.log(`Loaded file (${file}).`);
}

console.log('===============');

// Serve client:
const server = http.createServer((req, res) => {
    // TODO: Fix how SVG is served.
    if (req.url === '/') return res.end(files['src/client/index.html']);
    if (req.url.includes('svg')) return res.setHeader('Content-Type', 'image/svg+xml');
    return res.end(files[`src${req.url}`] || '404');
});

server.listen(8080, () => { 
    console.log('Client has fully loaded! Being served at `localhost:8080`.'); 
});

require('./src/server/Server'); // Starts the server.
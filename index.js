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
console.log('==================');

for (let [file] of Object.entries(files)) {
    const data = fs.readFileSync(file);
    if (file.endsWith('.svg')) file = file.replace('client/', '');

    files[file] = data;
    console.log(`Loaded file (${file}).`);
}

console.log('==================');

const server = http.createServer((req, res) => {
    // Request handlers:
    req.on('error', function(error) {
        console.error(error);
        res.statusCode = 500;
        res.end('500 Internal Server Error');
    });

    // Serve frontend files:
    if (req.url === '/' && req.method === 'GET') return res.end(files['src/client/index.html']); // Provide mainfile if GET request made to main page.

    // Intermediary to send correct content types (if HTTP fails to set them):
    if (req.url?.includes('svg')) res.setHeader('Content-Type', 'image/svg+xml'); // Explicitly set SVG content type.
    
    return res.end(files[`src${req.url}`] || '404 Not Found'); // Sends the file if it exists, otherwise gives a 404 Error.
});

server.listen(8080, () => { 
    console.log('Client has fully loaded! Being served at http://localhost:8080.'); 
    require('./src/server/Server'); // Starts the server.
});
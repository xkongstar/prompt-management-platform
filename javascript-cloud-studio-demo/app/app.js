const fs = require('fs');
const http = require('http');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

http.createServer(function (req, res) {
    if (/^\/static/.test(req.url)) {
        const resource = fs.readFileSync(path.join(assetsDir, req.url));
        res.end(resource);
        return;
    }
    const html = fs.readFileSync(path.join(assetsDir, 'index.html'));
    res.setHeader('Content-Type','text/html;charset=utf-8');
    res.end(html);
}).listen(9000);

console.log('Server running at http://127.0.0.1:9000/');

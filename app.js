
const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;
const api = require('zotero-api-client');
var items = null;

async function asyncCall() {
    console.log('calling');
    const options = { limit: 1000 };
    const response = await api().library('group', 2129771).collections('2GFF835P').items().top().get(options);
    items = response.getData();
    console.log(items.map(i => i.title));
    // return items;
}

asyncCall();

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    console.log("Hello");
    res.end('Hello World\n' + items.map(i => i.title));
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});





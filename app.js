
const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;
const api = require('zotero-api-client');
var url = require('url');
const group = 2129771;

async function apiCall(q) {
    console.log('calling: '+q.collection + " " + q.item);
    var options = { limit: 10 };
    var item = null;
    if (q.item) {
	item = q.item;
	options.item = q.item;
    } else {
	item = '';
    };
    console.log(`item ${item}`);
    const response = await api().library('group', group).collections(q.collection).items(item).top().get(options);
    // const response = await api().library('group', group).items(item).get(options);
    const items = response.getData();
    return items;
}

async function doIt(q) {
    var out = "";
    out += `${hostname}:${port}/?collection=${q.collection}&item=${q.item}\n`;
    out += `https://api.zotero.org/groups/${group}/collectios/${q.collection}/topItems\n`;
    out += `https://api.zotero.org/groups/${group}/items/${q.item}\n`;
    out += `https://api.zotero.org/groups/${group}/items/${q.item}/children\n`;
    const items = await apiCall(q);
    out += items.length + "\n";
    for(var i=0; i<items.length; i++) {
	if (items[i]) {
	    out += items[i].key + ": " + items[i].title + "\n";
	};
    };
    out += "END";
    console.log(out);
    return out;
};

doIt({collection: '2GFF835P', item: 'WBR6SFD7'});

const server = http.createServer();
server.on('request', async (req, res) => {
    console.log(req.url);
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 200;
    var q = url.parse(req.url, true).query;
    //console.log(items.map(i => i.title));
    var out = await doIt(q);
    res.end(out);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});





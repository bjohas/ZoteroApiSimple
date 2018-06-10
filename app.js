
const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;
const api = require('zotero-api-client');
var url = require('url');
const group = 2129771;

async function apiCall(q) {
    console.log('calling: '+q.collection + " " + q.item);
    var options = { limit: 10, include: "bib,citation,data,coins,mods,rdf_dc,ris", format: "json", style: "apa" };
    var item = null;
    if (q.item) {
	item = q.item;
	options.itemKey = q.item;
    } else {
	item = '';
    };
    var collection = null;
    if (q.collection) {
	options.collection = q.collection;
	collection = q.collection;
    } else {
    };   
    console.log(`collection ${collection}, item ${item}`);
    // You cannot call collections() without an argument it seems, hence:
    if (collection != null) {
	response = await api().library('group', group).collections(collection).items().top().get(options);
    } else {
	response = await api().library('group', group).items().top().get(options);
    };
    // const response = await api().library('group', group).items(item).get(options);
    // console.log(`Get`);
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
    try {
	for(var i=0; i<items.length; i++) {
	    if (items[i]) {
		out += items[i].key + ": " + items[i].title + "\n";
		out += JSON.stringify(items[i])+"\n";
	    };
	};
    } catch (e) {
	out += e;
	console.log("Error: "+e);
    };
    out += "END";
    console.log(out);
    return out;
};

// doIt({collection: '2GFF835P'});
// doIt({item: 'WBR6SFD7'});
doIt({collection: '2GFF835P', item: 'WBR6SFD7'});

const server = http.createServer();
server.on('request', async (req, res) => {
    console.log("URL: "+req.url);
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 200;
    var q = url.parse(req.url, true).query;
    //console.log(items.map(i => i.title));
    var out = "No results";
    if (q.item || q.collection) {
	out = await doIt(q);
    };
    res.end(out);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});


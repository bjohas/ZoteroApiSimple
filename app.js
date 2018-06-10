
const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;
const api = require('zotero-api-client');
var url = require('url');


async function apiCall(q) {
    console.log('calling: '+q.group+" "+q.collection + " " + q.item);
    var options = { limit: 3, include: "bib,citation,data,coins,mods,rdf_dc,ris", format: "json", style: "apa" };
    var group = q.group;
    delete q.group;
    var raw = q.raw;
    delete q.raw;
    var item;
    if (q.item) {
	item = q.item;
	// If this is removed, both the item and collection query produce the same number of results (i.e. limit: 3)
	// options.itemKey = q.item;
    } else {
	item = '';
    };
    var collection = null;
    if (q.collection) {
	options.collection = q.collection;
	collection = q.collection;
    } else {
    };
    if (q.limit) {
	options.limit = q.limit;
    };
    console.log(`collection ${collection}, item ${item}`);
    // You cannot call collections() without an argument it seems, hence:
    var response = null;
    if (collection != null) {
	response = await api().library('group', group).collections(collection).items().top(item).get(options);
    } else {
	response = await api().library('group', group).items(item).top().get(options);
    };
    var items = null;
    if (raw) {
	items = response.raw;
	// let citations = response.raw.map(r => 'citation' in r && r.citation || null);
    } else {
	items = response.getData();
    };
    // console.log("-->"+JSON.stringify(items));
    return items;
}

function processItems(items,raw) {
    var out = "";
    out += `Mode ${raw}\n`;
    //    console.log(typeof(items)+"-->"+JSON.stringify(items).replace(/\}\,\{/g,"},\n\n{"));
    try {
	if (raw) {
	    for (var property in items) {
		if (items.hasOwnProperty(property)) {
		    console.log(property);
		    out += items[property].data.key + ": " + items[property].data.title + "\n";
		    // out += JSON.stringify(items[property])+"\n\n";
		    out += JSON.stringify(Object.keys(items[property]))+"\n";
		}
	    }
	} else {
	    out += items.length + "\n";   
	    for(var i=0; i<items.length; i++) {
		if (items[i]) {
		    out += items[i].key + ": " + items[i].title + "\n";
		    //out += JSON.stringify(items[i])+"\n\n";
		    out += JSON.stringify(Object.keys(items[i]))+"\n";
		};
	    };
	};
    } catch (e) {
	out += e;
	console.log("Error: "+e);
    };
    return out;
}

async function doIt(q) {
    out += `${hostname}:${port}/?collection=${q.collection}&item=${q.item}\n`;
    out += `https://api.zotero.org/groups/${q.group}/collectios/${q.collection}/topItems\n`;
    out += `https://api.zotero.org/groups/${q.group}/items/${q.item}\n`;
    out += `https://api.zotero.org/groups/${q.roup}/items/${q.item}/children\n`;
    var raw = q.raw;
    if (!raw) {
	raw = true;
	q.raw = raw;
    };
    const items = await apiCall(q);
    var out = processItems(items,raw);    
    out += "\n\nDone.";
    console.log(out);
    return out;
};

doIt({group: 2129771, collection: '2GFF835P', raw: true});
doIt({group: 2129771, item: 'WBR6SFD7', raw: true});
doIt({group: 2129771, collection: '2GFF835P', item: 'WBR6SFD7', raw:true}); 

/*
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
*/




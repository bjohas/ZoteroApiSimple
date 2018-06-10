
const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;
const proto = "http://";
const api = require('zotero-api-client');
var url = require('url');


async function apiCall(q) {
    console.log('calling: '+q.group+" "+q.collection + " " + q.item);
    var options = { limit: 1000, include: "bib,citation,data,coins,mods,rdf_dc,ris", format: "json", style: "apa" };
    var showCollections = true;
    if (q.showCollections != undefined ) {
	showCollections = q.showCollections;
    } else {
    };
    var item = null;
    if (q.item) {
	item = q.item;
	// If this is removed, both the item and collection query produce the same number of results (i.e. limit: 3)
	options.itemKey = q.item;
    } else {
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
    // Note: The following all use 'top', i.e. only top level items will be returned (in the library or collection)
    try {
	// If an item is specified, get the item. (showCollections is irrelevant)
	if (item != null) {
	    const multiread = true;	   
	    if (!multiread) 
		// The query for a 'SingleRead' response is:
		response = await api().library('group', q.group).items(item).get(options);
	    else 
		// However, if we set options.itemKey above we can do this to get a MultiRead response, that can then be processed like the others:
		response = await api().library('group', q.group).items().get(options);
	    // Note: The items(item) in this query doesn't seem to do anyhthing:
	    //response = await api().library('group', q.group).collections(collection).items(item).top().get(options);	    
	} else if (collection != null) {	    
	    if (showCollections) {
		response = await api().library('group', q.group).collections(collection).subcollections().get(options);
	    } else {
		response = await api().library('group', q.group).collections(collection).items().top().get(options);
	    };
	} else {
	    if (showCollections) {
		response = await api().library('group', q.group).collections().top().get(options);
	    } else {
		response = await api().library('group', q.group).items().top().get(options);
	    };
	};
    } catch (e) {
	console.log(e);
    };
    var items = null;
    if (q.raw) {
	items = response.raw;
	// let citations = response.raw.map(r => 'citation' in r && r.citation || null);
    } else {
	items = response.getData();
    };
    // console.log("-->"+JSON.stringify(items));
    return items;
}
const textOutput = false;

function linkq(q,prefix,post) {
    if (textOutput) {
	return prefix+q.group+":"+q.collection+":"+q.showCollections+":"+q.item + post + "\n";
    } else {
	return `<div>${prefix}<a href="${proto}${hostname}:${port}/?group=${q.group}&collection=${q.collection}&item=${q.item}&showCollections=${q.showCollections}">${q.group}:${q.showCollections}:${q.collection}:${q.item}</a>${post}</div>\n`;
    }
}

function linkx(prefix,href) {
    return link(prefix, href, href, "");
}
function link(prefix,href,text,post) {
    if (textOutput) {
	return prefix + ": " + href + " - " + text + "; " + post + "\n";
    } else {
	return `<div>${prefix}<a href="${proto}${href}">${text}</a>${post}</div>\n`;
    }
}

function trimBib(str) {
    return `<div style="margin-left: 50px">`+str.replace(/\<\/?div[^\>]*\>/sgi,"")+"</div>";
}

function processItems(q,items) {
    var out = "";
    //console.log(typeof(items)+"-->"+JSON.stringify(items).replace(/\}\,\{/g,"},\n\n{"));
    console.log(JSON.stringify(q));
    try {
	if (q.raw) {
	    for (var property in items) {
		if (items.hasOwnProperty(property)) {
		    // console.log("->"+JSON.stringify(items[property]).replace(/\}\,\{/g,"},\n\n{"));
		    if ( items[property].data.title ) {
			var qin = Object.assign({}, q);
			qin.item = items[property].data.key;
			//out += linkq(qin,"ITEM (", "): " + items[property].data.title);
			out += linkq(qin,"ITEM (", "): " + trimBib(items[property].bib) + items[property].coins);
		    } else if (items[property].data.name ) {
			var qin = Object.assign({}, q);
			qin.collection = items[property].data.key;
			out += linkq(qin,"COLL (", "): " + items[property].data.name);
		    } else {
			out += linkq(qin,"OTHER (", ")");
		    };
		    // out += JSON.stringify(Object.keys(items[property]))+"\n";
		    // out += JSON.stringify(items[property])+"\n\n";
		}
	    }
	} else {
	    out += items.length + "\n";   
	    for(var i=0; i<items.length; i++) {
		if (items[i]) {
		    out += items[i].key + ": " + items[i].title + "\n";
		    // out += JSON.stringify(items[i])+"\n\n";
		    // out += JSON.stringify(Object.keys(items[i]))+"\n";
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
    var out = "";
    out += link("This page: ",
		`${hostname}:${port}/?group=${q.group}&collection=${q.collection}&item=${q.item}&showCollections=${q.showCollections}`,
		`${q.group}:${q.showCollections}:${q.collection}:${q.item}`,".");
    if (q.collection != undefined) 
	out += linkx("Guessed API link: ",`https://api.zotero.org/groups/${q.group}/collections/${q.collection}/topItems`);
    else
	out += linkx("Guessed API link: ",`https://api.zotero.org/groups/${q.group}/collections`);
    if (q.item != undefined) {
	out += linkx("Guessed API link: ",`https://api.zotero.org/groups/${q.group}/items/${q.item}`);
	out += linkx("Guessed API link: ",`https://api.zotero.org/groups/${q.roup}/items/${q.item}/children`);
    };
    var qin = Object.assign({}, q);
    out += "<p></p><div>Results</div>\n";
    if (q.showCollections) {
	qin.showCollections = false;
	out += linkq(qin,"(Showing collections - view items instead: " , ")");
    } else if (!q.item) {
	qin.showCollections = true;
	out += linkq(qin,"(Showing items - view (sub)collections instead: " , ")");
    } else {
	out += "<div>Showing an item - which may have children. Not implemented yet.</div>\n";
	qin.showCollections = false;
	delete qin.item;
	out += linkq(qin,"(Back to collection you came from: " , ")");
    };
    //out += "<p>Results (collections: "+q.showCollections+")</p>\n";
    out += "<p></p>\n";
    if (!q.raw) {
	q.raw = true;
    };
    const items = await apiCall(q);
    out += processItems(q,items);
    out += "\n\nDone.";
    console.log(out);
    return out;
};

//----- Show items (skipped because there are many
// doIt({group: 2129771, showCollections: false}); 
//----- Show collections at root of library
//doIt({group: 2129771, showCollections: true});
//----- Show subcollection of Y4TEWG8G
//doIt({group: 2129771, collection: 'Y4TEWG8G', raw: true, showCollections: true});
//----- Show items in Y4TEWG8G
//doIt({group: 2129771, collection: 'Y4TEWG8G', raw: true, showCollections: false});
// Other:
//doIt({group: 2129771, item: 'WBR6SFD7', raw: false});
//doIt({group: 2129771, collection: '2GFF835P', item: 'WBR6SFD7', raw:true}); 


const server = http.createServer();
server.on('request', async (req, res) => {
    console.log("URL: "+req.url);
    if (textOutput) {
	res.setHeader('Content-Type', 'text/plain');
    } else {
	res.setHeader('Content-Type', 'text/html');
    };
    res.statusCode = 200;
    if (req.url != '/favicon.ico') {
	var q = url.parse(req.url, true).query;
	console.log(JSON.stringify(q));
	if (!q.group) q.group = 2129771;	
	if (q.showCollections == 'true') 
	    q.showCollections = true;
	else
	    q.showCollections = false;
	for (var property in q) {
	    if (q[property] == 'undefined') {
		delete q[property];
	    };
	};
	var top = "<html><body>\n";
	top += linkq({group: q.group, showCollections: true},"View group -> ","");
	var qin = Object.assign({}, q);
	qin.showCollections = false;
	top += linkq(qin,"View items in library/collection-> " , "");
	qin.showCollections = true;
	top += linkq(qin,"View subcollections in library/collections -> " , "");
	var out = "No results";
	console.log(JSON.stringify(q));
	if (q.item || q.collection || q.group) {
	    out = await doIt(q);
	};
	res.end(top+out);
    } else {
	res.end();
    };
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

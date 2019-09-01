const fs = require('fs');
const http = require('http');
const url = require('url');

const json = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8');
//console.log(json);
const laptopData = JSON.parse(json);
//console.log(laptopData);

const server = http.createServer((req, res) => {

    const pathName = url.parse(req.url, true).pathname;
    console.log(url.parse(req.url, true));
    const id = url.parse(req.url, true).query.id;

    if (pathName === '/products' || pathName === '/') {
        res.writeHead(200, { 'Content-type': 'text/html'});
        res.end('This is the PRODUCTS page');
    }

    else if (pathName === '/laptop' && id < laptopData.length) {
        res.writeHead(200, { 'Content-type': 'text/html'});
        res.end(`This is the LAPTOP page for laptop ${id}!`);
    }

    else {
        res.writeHead(404, { 'Content-type': 'text/html'});
        res.end('URL was not found on the server!');
    }

});

server.listen(1337, '127.0.0.1', () => {
    console.log('Listening for requests now');
});




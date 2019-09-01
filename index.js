const fs = require('fs');
const http = require('http');
const url = require('url');

// Here we did the sync file read. because this only happens once you start your app and not while maybe many users might be using your app at the same time.
const json = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8');
//console.log(json);
const laptopData = JSON.parse(json);
//console.log(laptopData);

// Each time someone accesses your code this is the callback function that is executed. This is where you don't want to block the main thread.
const server = http.createServer((req, res) => {

    const pathName = url.parse(req.url, true).pathname;
    //console.log(pathName);
    const id = url.parse(req.url, true).query.id;

    // PRODUCTS OVERVIEW
    if (pathName === '/products' || pathName === '/') {
        res.writeHead(200, { 'Content-type': 'text/html'});

        fs.readFile(`${__dirname}/templates/template-overview.html`, 'utf-8', (err, data) => {
            let overviewOutput = data;

            fs.readFile(`${__dirname}/templates/template-card.html`, 'utf-8', (err, data) => {
            
                const cardsOutput = laptopData.map(el => replaceTemplate(data, el)).join('');
                overviewOutput = overviewOutput.replace('{%CARDS%}', cardsOutput);
                
                res.end(overviewOutput);
            });
        });

    }

    // LAPTOP DETAIL
    else if (pathName === '/laptop' && id < laptopData.length) {
        res.writeHead(200, { 'Content-type': 'text/html'});
        
        // This time we are not going to save anything to any variable like we did up there, but instead wait until node finishes reading our file (async)
        // and then calls our callback and passes the data into that callback as the data parameter.
        // So in this callback we'll have access to that data using the data parameter. 
        fs.readFile(`${__dirname}/templates/template-laptop.html`, 'utf-8', (err, data) => {
            const laptop = laptopData[id];
            const output = replaceTemplate(data, laptop);
            res.end(output);
        });
    }

    // IMAGES
    else if ((/\.(jpg|jpeg||png|gif)$/i).test(pathName)) {
        fs.readFile(`${__dirname}/data/img${pathName}`, (err, data) => {
            res.writeHead(200, { 'Content-type': 'image/jpg'});
            res.end(data);
        });
    }

    // URL NOT FOUND
    else {
        res.writeHead(404, { 'Content-type': 'text/html'});
        res.end('URL was not found on the server!');
    }

});

server.listen(1337, '127.0.0.1', () => {
    console.log('Listening for requests now');
});

function replaceTemplate(originalHtml, laptop) {
    let output = originalHtml.replace(/{%PRODUCTNAME%}/g, laptop.productName);
    output = output.replace(/{%IMAGE%}/g, laptop.image);
    output = output.replace(/{%PRICE%}/g, laptop.price);
    output = output.replace(/{%SCREEN%}/g, laptop.screen);
    output = output.replace(/{%CPU%}/g, laptop.cpu);
    output = output.replace(/{%STORAGE%}/g, laptop.storage);
    output = output.replace(/{%RAM%}/g, laptop.ram);
    output = output.replace(/{%DESCRIPTION%}/g, laptop.description);
    output = output.replace(/{%ID%}/g, laptop.id);
    return output;
}




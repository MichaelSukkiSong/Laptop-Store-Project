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
    //console.log(url.parse(req.url, true));
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
        
        // Many time in node there are sync and async versions of the same function.
        // The sync version is always blocking. it makes the entire code stop for the time that the function is doing its work and that is going to block the entire
        // thread for all the users that are accessing your code. Because nodejs runs in a single thread. so there is only one thread in the computer that runs your application
        // no matter if you have ten users or million users accesing your app at the same time. 
        // So if you block the single thread with sync functions that takes up alot of time, all other users will have to wait until that function finishes its work.
        // So we usually we always try to use the async versions. Because then they do the work in the background and as soon they are finished they simply run the callback
        // that we pass into a async function. so that is what we are doing here. the async fileread.

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
    // node js doesnt serve any files by default. every url is always like a route.
    // On the nodejs server the concepts of folders and files does not really exist. everything is like a request. and if we request a image we have to respond to that request.
    // so we need a route for the images as well. so then we can servce these images on these requests.
    else if ((/\.(jpg|jpeg|png|gif)$/i).test(pathName)) { // a true/false value indicating the resource that we are requesting is an image. test is a method available in all regular exp in JS.
        fs.readFile(`${__dirname}/data/img${pathName}`, (err, data) => { // we do not do character encoding because this is an image.
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




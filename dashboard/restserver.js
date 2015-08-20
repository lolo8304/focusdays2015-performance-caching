// Focusday 2015
// *************
// this script is running as a nodejs service on the server side. It
// listens for GET and POST requests on the port 3000. The requests
// are forwarded to the MongoDB which is running on the same host.
// The nginx server forwards the request to this service
// The nginx configuration: C:\Users\rene\nginx-1.9.3\conf/nginx.conf

// complete tutorial: http://thejackalofjavascript.com/nodejs-restify-mongolab-build-rest-api/

var restify = require('restify');
var mongojs = require('mongojs');


var db = mongojs('localhost/nodetest1', ['products']);

// Server
var server = restify.createServer();

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get("/alive",  function (req, res, next) {
  console.log("nodejs is alive  ");
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('nodejs server is alive\n\n'+req);

  return;
});

server.get("/products", function (req, res, next) {
    console.log("request products ");
    db.products.find(function (err, products) {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(products));
    });
    console.log("request products returns");
    return next();
});

server.get('/product/:id', function (req, res, next) {
    db.products.findOne({
        id: req.params.id
    }, function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(data));
    });
    return next();
});

// stores to request data to the MongoDB and returns the nummber of items in the DB
server.post('/product', function (req, res, next) {
   console.log("store /product  ");
    var product = req.params;
    db.products.save(product,
        function (err, data) {
            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8'
            });
            res.end(JSON.stringify(data));
        });
    
    // "strategy":"no-cache"
    // FIXME: get count of all documents of the given strategx....o
   // console.log("stored   "+db.products.find({"strategy":"no-cache"}).count());
    return next();
});

server.put('/product/:id', function (req, res, next) {
   console.log("store /product/:id  ");
    // get the existing product
    db.products.findOne({
        id: req.params.id
    }, function (err, data) {
        // merge req.params/product with the server/product

        var updProd = {}; // updated products 
        // logic similar to jQuery.extend(); to merge 2 objects.
        for (var n in data) {
            updProd[n] = data[n];
        }
        for (var n in req.params) {
            updProd[n] = req.params[n];
        }
        db.products.update({
            id: req.params.id
        }, updProd, {
            multi: false
        }, function (err, data) {
            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8'
            });
            res.end(JSON.stringify(data));
        });
    });
    return next();
});

// deletes the given id
// if {} is sent, all documents in the DB are removed
server.del('/product/:id', function (req, res, next) {
    db.products.remove({
        id: req.params.id
    }, function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(true));
    });
    return next();
});

server.listen(3000, function () {
    console.log("Server started @ 3000");
});

module.exports = server;

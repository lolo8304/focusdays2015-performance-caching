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

// Return ALL products
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


// return the last N products from stragtegy
// usage: http://localhost:3000/products/100/strategy/no-cache
server.get("/products/:n/strategy/:strategy", function (req, res, next) {
	var n = req.params.n;
	var strategy = req.params.strategy;
	console.log("request "+n+" products  ");
	
	db.products.find({ "strategy":strategy }).sort({_id: -1}).limit(n, function (err, products) {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(products));
    });
    return next();
});

	
		
	// TRY TO GET ENTRIES STARTING WITH :ID, BUT NOT WORKING YET...
server.get("/productfrom/:id", function (req, res, next) {
	var id = req.params.id;
	console.log("request  products  from "+id);
	db.products.find({ "strategy":"no-cache" }).sort({_id: -1}).limit(1000, function (err, products) {
		//	var newestEntry = parseInt(products[0]._id, 16);
//	var requestEntry = parseInt(req.params.id, 16);
//	var x = newestEntry - requestEntry;
//	console.log("request x = lastId - id ="+ x +" = "+newestEntry+" - "+requestEntry);
//		db.     col.find({_id: {$gt: {ObjectId("50911c4709913b2c643f1216")}}});
//	db.products.find({ "strategy":"no-cache" }).sort({_id: -1}).limit(10, function (err, products) {
	//db.products.find(function (err, products) {
//	   db.products.find( { _id: { $gt: requestID } }  , function(err, products) {
//		  db.products.find(  function(err, products) {
		  res.writeHead(200, {
		      'Content-Type': 'application/json; charset=utf-8'
		  });
		  for(var x in products){
			    console.log(": "+products[x]._id);
			    if (products[x]._id == requestID) {
			    	console("ABORT "+x	)
			    }
		  }
		  
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
    	   console.log("store /product  "+JSON.stringify(data));
           res.writeHead(200, {'Content-Type': 'text/html'});
           res.end();
//            res.writeHead(200, {
//                'Content-Type': 'application/json; charset=utf-8'
//            });
//            res.end();
            return;
        });
    
    // "strategy":"no-cache"
    // FIXME: get count of all documents of the given strategx....o
   // console.log("stored   "+db.products.find({"strategy":"no-cache"}).count());
    return "";
});

server.post('/product/:id', function (req, res, next) {
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
    return "";
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

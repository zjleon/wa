var express = require('express');
var path = require('path');
var router_to_track_request = require('./router_to_track_request.js');
var error_handling = require('./router_to_error_request.js');


var trackServer = express();
// console.log(router_to_track_request);
trackServer
.use(router_to_track_request)
.use(error_handling) // an handling function response to all requet in the end
.listen(8080);

var staticServer = express();
var staticPath = path.resolve(__dirname, '../ITG'); // using full path instead of relative path
staticServer
.use('/', express.static(staticPath)) // Set static resources
// Record all request sent to server
.use(function(req, res, next){
	console.log('request arrived, path: ' + req.path);
	res.status(200);
	next();
})
.listen(8088);
console.log('server started');
// console.info(__dirname);
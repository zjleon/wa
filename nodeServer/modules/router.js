var express = require('express');
var path = require('path');
var router_to_track_request = require('./router_to_track_request.js');
var error_handling = require('./router_to_error_request.js');


var trackServer = express();
// console.log(router_to_track_request);
trackServer
.use(router_to_track_request)
// an handling function response to all requet in the end
.use(error_handling)
.listen(8080);

var staticServer = express();
var staticPath = path.resolve(__dirname, '../ITG');
staticServer
// Set static resources, using full path instead of relative path
.use('/', express.static(staticPath))
// Record all request sent to server
.use(function(req, res, next){
	console.log('request arrived, path: ' + req.path);
	res.status(200);
	next();
})
.listen(8088);
console.log('server started');
// console.info(__dirname);
var express = require('express');
var trackServer = express();
var staticServer = express();
var router_to_track_request = require('./router_to_track_request.js');
var error_handling = require('./router_to_error_request.js');

// console.log(router_to_track_request);
trackServer
.use(router_to_track_request)
// an handling function response to all requet in the end
.use(error_handling)
.listen(8080);

staticServer
.use(express.static('./static'))
.listen(8088);
console.log('server started');
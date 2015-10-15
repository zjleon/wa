// return a router that use for track  request
// var httpStatusCode = {
//     success: 200,
//     failed: 400
// };
var expiresDate = new Date();
expiresDate = new Date(expiresDate.setFullYear(1970)).toUTCString();
// console.log(expiresDate);
var successHeader = {
    'Content-Length': 0,
    'Content-Type': 'text/plain',
    'Cache-Control': 0,
    'Expires': expiresDate,
    'Status': '200 OK',
    'Connection': 'close'
};

function response(res) {
    res.writeHead(httpStatusCode.success, successHeader);
}
var express = require('express');
var router = express.Router({
    strict: true
});
router.route('/t').post(function(req, res, next) {
    response(res);
    res.end();
    // console.log(2);
});
module.exports = router;
var express = require('express');
var router = express.Router();
router.post('*', function(req, res, next){
	res.sendStatus(200);
	res.end();
});
// function error_handling(err, req, res, next) {
//     res.status(200);
//     res.send();
//     res.end();
//     // console.log('page not found');
// }
module.exports = router;
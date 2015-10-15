var express = require('express');
var app = express();


app.use(function(req, res, next){
	console.log('request arrived');
	res.status(202);
	next();
});
// a middleware sub-stack which handles GET requests to /user/:id
app.get('/user/:id', function (req, res, next) {
  // if user id is 0, skip to the next route
  abc();
  if (req.params.id == 0) next('route');
  // else pass the control to the next middleware in this stack
  else {
  	res.end();
  	next();
  }
}, function (req, res, next) {
  // render a regular page
  console.log('regular');
  // res.sendStatus(202);
  //res.render('regular');
  res.end();
});
// handler for /user/:id which renders a special page
app.get('/user/:id', function (req, res, next) {
	console.log('regular');
 // res.render('special');
  res.end();
});

app.use(function(err, req, res, next){
	console.error('eee');
	res.send('Something broke!');
});

app.listen(8080);
console.log('app started');
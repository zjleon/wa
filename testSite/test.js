var jade = require('jade');
var fs = require('fs');
var tmpl = fs.readFileSync('./components/header/header.jade', 'utf8');
var options = JSON.parse(fs.readFileSync('./components/header/data.json', 'utf8'));
// console.log(variables);

var header = jade.compile(tmpl);
header = header(options);

console.log(header);

var jade = require('jade');
var fs = require('fs');
// get the jade template file
var tmpl = fs.readFileSync('./components/header/header.jade', 'utf8');
// get the value of variables to pass to the template
var options = JSON.parse(fs.readFileSync('./components/header/data.json', 'utf8'));
// console.log(variables);

// parse template to function
var header = jade.compile(tmpl);
// pass the values to the template
header = header(options);

console.log(header);

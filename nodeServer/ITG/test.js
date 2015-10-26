var jade = require('jade');
var fs = require('fs');
// get the jade template file
var testPageTmpl = fs.readFileSync('./pages/test/test.jade', 'utf8');
// get the value of variables to pass to the template
var options = JSON.parse(fs.readFileSync('./components/header/data.json', 'utf8'));
var currentFile = __filename;
console.log(currentFile);

// parse template to function
var layout = jade.compile(testPageTmpl, {filename:__filename, pretty: true});
// pass the values to the template
layout = layout(options);

console.log(layout);

fs.writeFile(__dirname + '/test.html', layout);


// grunt "./bootstrap4/gruntfile.js"
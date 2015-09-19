module.exports = function(grunt) {
  'use strict';

	grunt.registerMultiTask('setEnv', 'set server environment.', function() {
	  var key,
	  		reg,
	  		outPath,
	  		options,
	  		servers,
	  		cookies,
	  		fileName,
	  		template;
	  options = this.options({
	  });
	  // console.log(options);
	  template = grunt.file.read(options.template);
	  outPath = options.outPath;
	  
	  cookies = options.cookies;
		// console.log(cookies);
	  for(key in cookies){
	  	// replace the cookie settings
	  	reg = new RegExp('<%' + key + '%>', 'g');
	  	template = template.replace(reg, cookies[key]);
	  }
	  
	  fileName = options.fileName;
	  servers = options.servers;
	  servers.forEach(function(server){
			var reg,
					key,
					tmpl;
			if(!server.enable){
				// ignore the disabled server
				return;
			}
			tmpl = template;
			for(key in server){
				// console.log(server[key]);
				// replace the specify setting in the template
				reg = new RegExp('<%' + key + '%>', 'g');
				tmpl = tmpl.replace(reg, server[key]);
			}
			// console.log(tmpl);
			grunt.file.write(outPath + '/' + server.name + '.' + fileName, tmpl);
		});
		console.log('environment setting completed.');
	  
	});
};
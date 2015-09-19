'use strict';

module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('config.json');
	var excludeCfg = grunt.file.readJSON(pkg.path.modules + '/' + pkg.file.exclude);
	var testRequireArr = grunt.file.readJSON(pkg.path.unitTest + '/' + pkg.file.testRequireList);
	
  // Project configuration.
  grunt.initConfig({
  	pkg : pkg,
    // Task configuration.
    
    watch: {
    	options: {
    		// debounceDelay: 5000,
    		livereload: true,
    		interrupt: true
    		// livereloadOnError: false
    	},
			gruntfile: {
				files: '<%= pkg.file.gruntCfg %>',
				tasks: ['jasmine', 'amdBuild']
			},
			modules: {
				files: ['<%= pkg.path.modules %>/**/*.js'],
				tasks: ['jasmine', 'amdBuild']
			},
			test: {
				files: ['<%= pkg.path.unitTest %>/**/*.js'],
				tasks: ['prepareTest', 'jasmine']
			}
    },
    clean: {
		  tmpDir: ['<%= pkg.path.tmpDir %>/*.js'],
		  testRequireList: ['<%= pkg.path.unitTest %>/<%= pkg.file.testRequireList %>']
		},
    
    // concat
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      			'<%= grunt.template.today("yyyy-mm-dd") %> */\n',
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: false
      },
      almond: {
        src: [
        	'<%= pkg.path.lib %>/<%= pkg.file.closureHead %>',
        	'<%= pkg.path.lib %>/<%= pkg.file.almond %>',
        	'<%= pkg.path.lib %>/<%= pkg.file.promise %>',
        	'<%= pkg.path.tmpDir %>/<%= pkg.file.amdBuilded %>',
        	'<%= pkg.path.lib %>/<%= pkg.file.closureFoot %>'
        ],
        dest: '<%= pkg.path.tmpDir %>/<%= pkg.file.finalName %>'
      },
    },
    setEnv: {
    	main: {
    		options:{
    			template: '<%= pkg.path.tmpDir %>/<%= pkg.file.finalName %>',
    			fileName: '<%= pkg.file.finalName %>',
	    		cookies: pkg.cookies,
	    		servers: pkg.servers,
	    		outPath: '<%= pkg.path.finalDir %>'
    		}
    	}
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: '<%= pkg.path.finalDir %>/<%= pkg.name %>.min.js'
      },
    },
    
    // amd build 
    requirejs: {
		  web: {
				options: {
				  baseUrl: '<%= pkg.path.modules %>',
				  name: 'wa',
				  out: '<%= pkg.path.tmpDir %>/<%= pkg.file.amdBuilded %>',
				  exclude: excludeCfg.web,
				  // excludeFile: '<%= pkg.path.modules %>/<%= pkg.file.exclude %>',
				  removeCombined: true,
				  optimize: 'none'
				  // optimizeAllPluginResources: true
				}
		  }
		},
		// fixExclude: {
			// options: {
				// excludeFile: '<%= pkg.path.modules %>/<%= pkg.file.excludeCfg %>'
			// },
			// main: {}
		// }
		
		// unit test
		jasmine: {
		  runTest: {
		    src: testRequireArr,
		    options: {
		      // specs: '<%= pkg.path.unitTest %>/spec/**/*.js',
		      specs: '<%= pkg.path.unitTest %>/spec/data/test.storage.js',
		      helpers: '<%= pkg.path.unitTest %>/helper/**/*.js',
		      template: require('grunt-template-jasmine-requirejs'),
		      templateOptions: {
		      	requireConfig: {
		      		baseUrl: '<%= pkg.path.modules %>'
		      	}
		      }
		    }
		  },
		},
		bump: {
	    options: {
	      pushTo: 'origin'
	    }
	 },
	 connect: {
		  test: {
		  	options: {
			    port: 16387,
			    base: '.',
			    hostname: '127.0.0.1'
		  	}
		  }
		}
	});

  // These plugins provide necessary tasks.
  //grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  //amd build
  grunt.loadTasks('task');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-internal');
  //test
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-npm');
  grunt.loadNpmTasks('grunt-bump');

  // Default task.
  grunt.registerTask('prepareTest', ['clean:testRequireList', 'buildTestRequireList']);
  grunt.registerTask('startTest', ['connect', 'jasmine']);
  grunt.registerTask('amdBuild', ['clean:tmpDir', 'requirejs', 'concat:almond', 'setEnv']);
  grunt.registerTask('default', ['prepareTest', 'startTest', 'amdBuild', 'watch']);
  // grunt.registerTask('default', ['setEnv']);

};

module.exports = function( grunt ) {
  // Project configuration.
  grunt.initConfig( {
    pkg: grunt.file.readJSON( 'package.json' ),

    // watch file modification
    watch: {
      options: {
        spawn: false,
        // reload: true
      },
      sassFiles: {
        files: [
          'sass/*.scss'
        ],
        tasks: [ 
          'clean:clear-before-sass-build', 
          'sass' 
        ]
        
      },
      // Watch html files change
      tmplFiles: {
        files:[
          'page/*.*'
        ],
        tasks: [
          'copy:tmpl'
        ]
      }
    },

    // Build sass files
    sass: {
      dist: {
        cwd: 'sass',
        src: '*.scss',
        dest: 'complied/tmp',
        expand: true,
        ext: '.css'
      }
    },

    // Adding css property prefix automatically
    autoprefixer: {
      options: {
        // Task-specific options go here. 
        remove:false
      },
      css: {
        // Target-specific file lists and/or options go here. 
        expand: true,
        flatten: true,
        src: 'complied/tmp/*.css',
        dest: 'complied/css/'
      },
    },

    // clean folder
    clean: {
        'clear-before-sass-build' :[ 
        'complied/css/',
        'complied/tmp/'
        ],
        'clear-after-prefix': [
        'complied/tmp/'
        ]
    },

    // Copy files after adding prefix
    copy: {
        options: {
          expand: true,
          flatten: true
        },
        'sass-map-files': {
            src: 'complied/tmp/*.map',
            dest: 'complied/css/',
            
        },
        'tmplFiles': {

        }
    }

  } );
  grunt.loadNpmTasks( 'grunt-contrib-sass' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-contrib-clean' );
  grunt.loadNpmTasks( 'grunt-contrib-copy' );
  grunt.loadNpmTasks( 'grunt-autoprefixer' );

  // Default task(s).
  grunt.registerTask( 'job1', [ 
    'clean:clear-before-sass-build', 
    'sass' ,
    'autoprefixer:css',
    'copy:sass-map-files',
    'clean:clear-after-prefix'
   ] );
  grunt.registerTask( 'default', [ 'job1', 'watch' ] );
};
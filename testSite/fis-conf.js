// default settings. fis3 release
var fs = require('fs');
var headerVars = JSON.parse(fs.readFileSync('./components/header/data.json', 'utf8'));

// Global start
fis.match( '*.{js,css}', {
  useHash: true
} );

fis.match( '::image', {
  useHash: true
} ).match( '*.png', {
  optimizer: fis.plugin( 'png-compressor' )
});

fis.match( '*.jade', {
  rExt: 'html'
} );

fis.match( '*.js', {
  optimizer: fis.plugin( 'uglify-js' )
}).match( 'node_modules/**', {
  release: false
}).match( 'Gruntfile.js', {
  release: false
});

fis.match( '*.scss', {
    release: false,
    parser: fis.plugin( 'sass' )
}).match( 'bootstrap4/**', {
  release: false
}).match( '*.css', {
    optimizer: fis.plugin( 'clean-css' )
});



// Global end

// default media is `dev`
fis.media( 'dev' )
.match( '*', {
    useHash: false,
    optimizer: null
}).match('test.jade', {
	parser: fis.plugin('jade', {
		pretty: true,
		data: headerVars
	})
}).match('*.png', {
	release: '/image/$0'
});

// extends GLOBAL config
fis.media( 'production' );

fis.config.set("project.watch.usePolling", true)

// fis.config.set('modules.postpackager', [
//     function (ret, conf, settings, opt) {
//         // ret.map  map.json 内容对象
//         // ret.src  源码列表
//         // ret.ids  ids 对应文件列表
//         // ret.pkg 合并的信息
//         console.log(ret.map);
//     }
// ]); 
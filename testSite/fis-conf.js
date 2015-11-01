var fs = require('fs');
var headerVars = JSON.parse(fs.readFileSync('./components/header/data.json', 'utf8'));

// Image setting
fis.match( '::image', {
  useHash: true
} ).match( '*.png', {
  optimizer: fis.plugin( 'png-compressor' )
});

// config template plugin
fis.match( '*.jade', {
  rExt: 'html'
}).match('*.jsx', {
  rExt: 'js',
  parser: fis.plugin('react')
});

// JS file setting
fis.match( '*.js', {
  useHash: true,
  optimizer: fis.plugin( 'uglify-js' )
}).match( 'node_modules/**', {
  release: false
}).match( 'Gruntfile.js', {
  release: false
});

// CSS file setting
fis.match( '*.scss', {
    // release: false,
    rExt: 'css',
    parser: fis.plugin( 'node-sass' )
}).match( 'bootstrap4/**', {
    release: false
}).match( '*.css', {
    useHash: true,
    optimizer: fis.plugin( 'clean-css' )
});


// default media is `dev`
fis.media( 'dev' )
.match( '*', {
    useHash: false,
    optimizer: null
}).match('test.jade', {
	parser: fis.plugin('jade-to-html', {
		pretty: true,
		data: headerVars
	})
}).match('*.png', {
	// release: '/image/$0'
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
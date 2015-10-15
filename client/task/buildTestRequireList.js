module.exports = function(grunt) {
    'use strict';
    grunt.registerTask('buildTestRequireList', 'building test require list.', function(testPath) {
        var cfg,
            testFiles,
            options,
            testPath,
            specPath,
            modulePath,
            outputName,
            requireArr = [];
        cfg = grunt.file.readJSON('config.json');
        testPath = cfg.path.unitTest;
        specPath = cfg.path.testSpec;
        modulePath = cfg.path.modules;
        outputName = cfg.file.testRequireList;
        console.log('getting all required js files...');
        grunt.file.recurse(specPath, function(abspath, rootdir, subdir, filename) {
            var file,
                tmp1,
                arr = requireArr;
            // only looking for sub dir file
            if (subdir) {
                // console.log(arr);
                file = grunt.file.read(abspath);
                // get all require js files in this file
                tmp1 = file.match(/require\(['"](.+?)(?=(\.js)?['"]\))/g);
                tmp1.forEach(function(s) {
                    var file;
                    file = modulePath + '/';
                    file += s.replace(/require\(['"]/, '');
                    file += '.js';
                    arr.push(file);
                });
            }
        });
        // console.log(requireArr);
        grunt.file.write(testPath + '/' + outputName, JSON.stringify(requireArr));
        console.log('list made.');
    });
};
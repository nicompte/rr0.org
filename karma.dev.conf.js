// Karma configuration
// Generated on Sun Aug 31 2014 23:47:07 GMT+0200 (CEST)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        files: [
            'bower_components/traceur-runtime/traceur-runtime.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'node_modules/karma-jasmine/**/*.js',
            'js/**/*.es5.js',
            'time/*.es5.js',
            'people/**/*.es5.js',
            'place/**/*.es5.js',
            'test/**/*Spec.js'
        ],

        // list of files to exclude
        exclude: [
            'bower_components/**/tests/*.*',
            'node_modules/**/tests/*.*'
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Firefox only is available on Travis VM : http://docs.travis-ci.com/user/gui-and-headless-browsers/
        // Current PhantomJS versions fail with traceur : https://github.com/google/traceur-compiler/issues/908
        //browsers: ['Chrome', 'Firefox'],
        browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
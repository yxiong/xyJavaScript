module.exports = function(grunt) {
  var autoprefixer = require('autoprefixer-core');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js',
              'battleship/battleship.js',
              'minesweeper/minesweeper.js',
              '2048/js/*.js']
    },
    postcss: {
      options: {
        processors: [
          autoprefixer({ browsers: ['last 2 version'] }).postcss
        ]
      },
      dist: {
        files: {
          '2048/css/main.css': '2048/css-dev/main.css',
          '2048/css/tile.css': '2048/css-dev/tile.css',
          '2048/css/mobile.css': '2048/css-dev/mobile.css'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-postcss');

  grunt.registerTask('default', ['jshint', 'postcss']);
};

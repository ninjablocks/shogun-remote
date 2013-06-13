module.exports = function(grunt) {
  var fs = require('fs');
  var copyFileSync = function(srcFile, destFile, encoding) {
    var content = fs.readFileSync(srcFile, encoding);
    fs.writeFileSync(destFile, content, encoding);
  };

 copyFileSync('index.html', 'index.min.html');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['gruntfile.js', 'src/**/*.js'],
      options: {
        /*globals: {
          jQuery: true,
          console: true,
          document: true
        }*/
      }
    },
    'usemin': {
      html: 'index.min.html'
    },
    'useminPrepare': {
      html: 'index.min.html'
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'usemin', 'smoosher']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-usemin');

  grunt.registerTask('default', ['jshint', 'useminPrepare', 'concat', 'uglify', 'usemin']);

};

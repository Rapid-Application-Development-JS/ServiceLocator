module.exports = function (grunt) {
  grunt.initConfig({
    config: grunt.file.readJSON('config.json'),
    copy: {
      build: {
        files: [
          {
            src: '<%= config.folderSource %>/<%= config.name %>.js',
            dest: '<%= config.folderCompiled %>/<%= config.name %>.min.js'
          }
        ]
      }
    },
    comments: {
      build: {
        options: {
          singleline: true,
          multiline: true
        },
        src: [
          '<%= config.folderCompiled %>/<%= config.name %>.min.js'
        ]
      }
    },
    uglify: {
      build: {
        options: {
          sourceMap: true
        },
        files: [
          {
            dest: '<%= config.folderCompiled %>/<%= config.name %>.min.js',
            src: '<%= config.folderCompiled %>/<%= config.name %>.min.js'
          }
        ]
      }
    },
    clean: {
      dev: {
        files: [
          {
            src: [
              '<%= config.folderSource %>/<%= config.name %>.js',
              '<%= config.folderCompiled %>/<%= config.name %>.min.js'
            ]
          }
        ]
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-stripcomments');
  grunt.registerTask('dev', ['clean:dev']);
  grunt.registerTask('default', ['copy:build', 'comments:build', 'uglify:build']);
};

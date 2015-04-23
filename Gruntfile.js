module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      build: {
        files: [
          {
            src: 'source/<%= pkg.lib_name %>.js',
            dest: 'release/<%= pkg.lib_name %>.min.js'
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
          'release/<%= pkg.lib_name %>.min.js'
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
            dest: 'release/<%= pkg.lib_name %>.min.js',
            src: 'release/<%= pkg.lib_name %>.min.js'
          }
        ]
      }
    },
    clean: {
      dev: {
        files: [
          {
            src: [
              'source/<%= pkg.lib_name %>.js',
              'release/<%= pkg.lib_name %>.min.js'
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

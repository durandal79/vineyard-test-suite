module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-hub')

  grunt.initConfig({
      hub: {
        all: {
          src: [
            'lib/Gruntfile.js',
            'node_modules/metahub/Gruntfile.js',
            'node_modules/ground/Gruntfile.js',
            'node_modules/vineyard/Gruntfile.js',
            'node_modules/lawn/Gruntfile.js',
            'node_modules/fortress/Gruntfile.js',
            'node_modules/plantlab/Gruntfile.js',
            'node_modules/vineyard-solr/Gruntfile.js'
          ]
        }
      },
      watch: {
        files: '<%= hub.all.src %>'
      }
  })

  grunt.registerTask('default', 'hub');

}
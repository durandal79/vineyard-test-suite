module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-hub')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.initConfig({
    hub: {
      all: {
        options: {
          concurrent: 16
        },
        src: [
          'node_modules/vineyard-metahub/Gruntfile.js',
          'node_modules/metahub3/Gruntfile.js',
          'node_modules/vineyard-ground/Gruntfile.js',
          'node_modules/vineyard/Gruntfile.js',
          'node_modules/vineyard-lawn/Gruntfile.js',
          'node_modules/vineyard-fortress/Gruntfile.js',
          'node_modules/vineyard-plantlab/Gruntfile.js',
          'node_modules/vineyard-solr/Gruntfile.js',
          'Gruntfile-Test.js'
        ],
        tasks: [ 'watch' ]
      }
    },
    watch: {
      hub: {
        files: '<%= hub.all.src %>'
      }
    }
  })

  grunt.registerTask('default', 'hub');

}
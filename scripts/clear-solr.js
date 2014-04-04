global.SERVER_ROOT_PATH = __dirname
var Vineyard = require('vineyard')
require('when/monitor/console')
var vineyard = new Vineyard('config/server.json')
vineyard.load_bulb('vineyard-solr')
  var solr = vineyard.bulbs['vineyard-solr']
solr.clear_all()
  .done(function() {console.log('done')})

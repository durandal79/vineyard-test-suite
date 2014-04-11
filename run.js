global.SERVER_ROOT_PATH = __dirname
var Vineyard = require('vineyard')
require('when/monitor/console')
var vineyard = new Vineyard('config/server.json')
vineyard.load_all_bulbs()
var args = process.argv
if (args.indexOf('debug-fortress') > -1)
  vineyard.bulbs.fortress.log = true

vineyard.start()

var when = require("when")
var PlantLab = require('vineyard-plantlab')
var Fixture = require('./../test/Fixture.js')

process.chdir('E:/websites/vineyard')
var lab = new PlantLab('config/server.json')
var ground = lab.ground
var fixture = new Fixture.Fixture(lab)

fixture.prepare_database()
  .then(function() {
    return fixture.populate()
  })
  .done()

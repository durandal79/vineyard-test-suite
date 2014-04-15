/// <reference path="../../node_modules/vineyard-plantlab/plantlab.d.ts"/>
/// <reference path="../../node_modules/vineyard-lawn/lawn.d.ts"/>
var buster = require("buster");
var assert = buster.referee.assert;
var when = require("when")
import PlantLab = require('vineyard-plantlab')
//process.chdir('..')
var lab = new PlantLab('config/server.json', ['lawn', 'fortress'])
var ground = lab.ground
var Fixture = require('../Fixture.js')
var fixture = new Fixture.Fixture(lab)
ground.log_queries = true


var Lawn = require('vineyard-lawn')
var Irrigation = Lawn.Irrigation

lab.test("Query test", {
  setUp: function () {
    this.timeout = 8000;
//    this.timeout = 10000;
    return fixture.prepare_database()
//      .then(()=> lab.start())
      .then(()=> fixture.populate())
      .then(()=> fixture.populate_characters())
  },
  tearDown: function () {
//    return lab.stop()
  },
  "multiple filters": function () {
    var socket
    var query = {
      "trellis": "character",
      "filters": [
        {
          "path": "name",
          "value": "James"
        },
        {
          "path": "is_alive",
          "value": false
        }
      ]
    }

    return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard)
      .then((response) => {
        var objects = response.objects
        console.log('objects', objects)
        assert.equals(objects.length, 1)
      })
  }
})

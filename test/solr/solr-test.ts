/// <reference path="../../node_modules/vineyard-plantlab/plantlab.d.ts"/>
require('when/monitor/console');
var buster = require("buster");
var assert = buster.referee.assert;
var when = require("when")
import PlantLab = require('vineyard-plantlab')
process.chdir('..')
var lab = new PlantLab('config/server.json')
var ground = lab.ground
var Fixture = require('../Fixture.js')
var fixture = new Fixture.Fixture(lab)
var pipeline = require('when/pipeline')
ground.log_queries = true

lab.test("Solr test", {
  setUp: function () {
    this.timeout = 7000;
    return fixture.prepare_database()
      .then(()=> lab.start())
      .then(()=> lab.vineyard.bulbs['vineyard-solr'].clear())
      .then(()=> fixture.populate())
      .then(()=> fixture.populate_characters())
  },
  tearDown: function () {
      lab.stop()
  },
  "=>query": function() {
    var socket
    var query = {
      "trellis": "character",
      "filters": [
        {
          "property": "all",
          "operator": "solr",
          "value": "Mr. Moss"
        }
      ]
    }
    return pipeline([
      () => lab.login_socket('cj', 'pass'),
      (s)=> socket = s,
      ()=> lab.emit(socket, 'query', query),
      (response)=> {
        console.log('response', response.objects)
        assert.equals(response.objects.length, 1)
      }
    ])
  },
  "suggestions": function() {
    return pipeline([
      ()=> lab.get_json('/vineyard/solr/character/suggest?q=jam'),
      (response)=> {
        console.log('response', response.objects)
        assert.equals(response.objects.length, 1)
      }
    ])
  }
})
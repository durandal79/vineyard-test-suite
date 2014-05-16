/// <reference path="../../node_modules/vineyard-plantlab/plantlab.d.ts"/>
/// <reference path="../../node_modules/vineyard-lawn/lawn.d.ts"/>
var buster = require("buster");
var assert = buster.referee.assert;
var when = require("when")
import PlantLab = require('vineyard-plantlab')
var lab = new PlantLab('config/server.json', ['lawn', 'fortress'])
var ground = lab.ground
var Fixture = require('../Fixture.js')
var fixture = new Fixture.Fixture(lab)
ground.log_queries = true

var Lawn = require('vineyard-lawn')
var Irrigation = Lawn.Irrigation

import Ground = require('vineyard-ground')

lab.test("Service test", {
  setUp: function () {
    console.log('starting service test')
    this.timeout = 10000;
    return fixture.prepare_database()
      .then(()=> lab.start())
      .then(()=> fixture.populate())
      .then(()=> fixture.populate_characters())
  },
  tearDown: function () {
    console.log('stopping')
    return lab.stop()
  },
  "http query": function () {
    var login, query = {
      "trellis": "character"
    }
    return lab.login_http('cj', 'pass')
      .then((s) => login = s)
      .then(() => console.log('login', login))
      .then(() => lab.post('/vineyard/query', query, login))
      .then((response) => {
        console.log('response', response.content)
        var objects = response.content.objects
        assert.equals(objects.length, 5)
        assert.equals(response.content.status, 200)
      })
  },
  "socket query": function () {
    var socket, query = {
      "trellis": "character"
    }
    return lab.login_socket('cj', 'pass')
      .then((s) => socket = s)
      .then(() => lab.emit(socket, 'query', query))
      .then((response) => {
        console.log('response', response)
        var objects = response.objects
        assert.equals(objects.length, 5)
      })
  }
})

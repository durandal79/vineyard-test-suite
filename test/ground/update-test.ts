/// <reference path="../../node_modules/vineyard-plantlab/plantlab.d.ts"/>
/// <reference path="../../node_modules/vineyard-lawn/lawn.d.ts"/>
var buster = require("buster");
var assert = buster.referee.assert;
var when = require("when")
import PlantLab = require('vineyard-plantlab')
process.chdir('..')
var lab = new PlantLab('config/server.json', ['lawn', 'fortress'])
var ground = lab.ground
var Fixture = require('../Fixture.js')
var fixture = new Fixture.Fixture(lab)
ground.log_queries = true

var pipeline = require('when/pipeline')
var Lawn = require('vineyard-lawn')
var Irrigation = Lawn.Irrigation

import Ground = require('vineyard-ground')

lab.test("Query test", {
  setUp: function () {
    this.timeout = 7000;
//    this.timeout = 10000;
    return fixture.prepare_database()
      .then(()=> lab.start())
      .then(()=> fixture.populate())
      .then(()=> fixture.populate_characters())
  },
  tearDown: function () {
    return lab.stop()
  },
  "remove": function () {
    var socket
    var update = {
      objects: [
        {
          "trellis": "user",
          "id": 7,
          "followers": [
            {
              "id":9,
              "_removed_": true
            }
          ]
        }
      ]
    }
    var query = {
      "trellis": "user",
      "expansions": [ "followers" ],
      "filters": [
        {
          "path": "id",
          "value": 7
        }
      ]
    }

    return pipeline([

      ()=> lab.login_socket('cj', 'pass'),
      (s) => socket = s,
      ()=> lab.emit(socket, 'update', update),
      ()=> lab.emit(socket, 'query', query)
        .then((response) => {
          var objects = response.objects
          console.log('response', response)
          assert.equals(objects.length, 1)
          assert.equals(objects[0].followers.length, 0)
        })
    ])
  },
  "complex cross table": function () {
    var socket
    var update = {
      objects: [
        {
          "trellis": "user",
          "id": 9,
          "followers": [ 12 ]
        }
      ]
    }
    var query = {
      "trellis": "user",
      "expansions": [ "followees" ],
      "filters": [
        {
          "path": "id",
          "value": 12
        }
      ]
    }

    return pipeline([

      ()=> lab.login_socket('cj', 'pass'),
      (s) => socket = s,
      ()=> lab.emit(socket, 'update', update),
      ()=> lab.emit(socket, 'query', query)
        .then((response) => {
          var objects = response.objects
//          console.log('response', response)
          assert.equals(objects.length, 1)
          assert.equals(objects[0].followees.length, 1)
          assert.equals(objects[0].followees[0].name, "froggy")
        })
    ])
  }
})


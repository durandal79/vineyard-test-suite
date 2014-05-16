/// <reference path="../../node_modules/vineyard-plantlab/plantlab.d.ts"/>
/// <reference path="../../node_modules/vineyard-lawn/lawn.d.ts"/>
var buster = require("buster");
var assert = buster.referee.assert;
var when = require("when")
import PlantLab = require('vineyard-plantlab')
var lab = new PlantLab('config/server.json', ['lawn', 'fortress', 'exile', 'songbird'])
var ground = lab.ground
var Fixture = require('../Fixture.js')
var fixture = new Fixture.Fixture(lab)
ground.log_queries = true
var pipeline = require('when/pipeline')

var Lawn = require('vineyard-lawn')

import Ground = require('vineyard-ground')

lab.test("Exile test", {
  setUp: function () {
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
  "ban": function () {
    var admin_socket, froggy_socket
    var disconnected = false, notified = false, update={
      objects:[
        {
          trellis: "ban",
          user: 9,
          reason: 3
        }
      ]
    }

    return pipeline([
      () => lab.login_socket('cj', 'pass'),
      (s)=> admin_socket = s,
      () => lab.login_socket('froggy', 'pass'),
      (s)=> froggy_socket = s,
      ()=> {
        froggy_socket.on('banned', ()=> {
          notified = true
        })
        froggy_socket.on('disconnect', ()=> {
          disconnected = true
        })
      },
      ()=> lab.emit(admin_socket, 'update', update),
      ()=> {
        var def = when.defer()
        setTimeout(()=> def.resolve(), 1000)
        return def.promise
      },
      ()=> {
        assert(notified, 'was notified')
        assert(disconnected, 'was disconnected')
      },
      () => lab.login_socket('froggy', 'pass')
    ])
  }
})

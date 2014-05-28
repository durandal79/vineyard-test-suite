/// <reference path="../../node_modules/vineyard-plantlab/plantlab.d.ts"/>
var buster = require("buster");
var assert = buster.referee.assert;

require('when/monitor/console')
var when = require("when")
var plantlab = require('vineyard-plantlab')
var lab = new plantlab('config/server.json', ['lawn', 'fortress'])
var ground = lab.ground
var Fixture = require('../Fixture.js')
var fixture = new Fixture.Fixture(lab)
var pipeline = require('when/pipeline')
//ground.log_queries = true
//ground.log_updates = true


lab.test("Notification test", {
  setUp: function () {
    this.timeout = 10000;
    console.log('starting notification test')
    return fixture.prepare_database()
      .then(()=> lab.start())
      .then(()=> fixture.populate())
  },
  tearDown: function () {
    return lab.stop()
  },
  "photo notifications": function () {
    var socket
    var update = {
      objects: [
        {
          "trellis": "character",
          "name": "deleteme"
        }
      ]
    }
    return pipeline([

      ()=> lab.login_socket('cj', 'pass'),
      (s) => socket = s,
      ()=> lab.emit(socket, 'room/join', 'event/7E6FB110-9B43-11E3-895F-CB7A0150F761'),
      ()=> {
        assert(true)
        return lab.emit(socket, 'update', update)
      }
    ])
  }
//  ,
//  "=>registration": function () {
//    var data = {
//      name: 'cj',
//      pass: ''
//    }
//    return pipeline([
//
//      ()=> lab.post('cj', 'pass'),
//      (s) => socket = s,
//      ()=> lab.emit(socket, 'room/join', 'event/7E6FB110-9B43-11E3-895F-CB7A0150F761'),
//      ()=> {
//        assert(true)
//        return lab.emit(socket, 'update', update)
//      }
//    ])
//  }
})
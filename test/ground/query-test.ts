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


var Lawn = require('vineyard-lawn')
var Irrigation = Lawn.Irrigation

import Ground = require('vineyard-ground')

lab.test("Query test", {
  setUp: function () {
    this.timeout = 5000;
//    this.timeout = 10000;
    return fixture.prepare_database()
//      .then(()=> lab.start())
      .then(()=> fixture.populate())
      .then(()=> fixture.populate_characters())
  },
//  tearDown: function () {
////    return lab.stop()
//  },
  "multiple filters": function () {
    console.log('multiple filters')
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
  },
  "pager": function () {
    console.log('pager')
    var socket
    var query = {
      "trellis": "character",
      "pager": {
        "limit": 2,
        "offset": 1
      }
    }

    return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard)
      .then((response) => {
        var objects = response.objects
//        console.log('response', response)
        assert.equals(objects.length, 2)
        assert.equals(response.total, 5)
      })
  },
  "list expansions": function () {
    var query = {
      "trellis": "character",
      "expansions": [
        "items"
      ]
    }

    return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard)
      .then((response) => {
        var objects = response.objects
//        console.log('response', response)
        assert.equals(objects.length, 5)
        assert.equals(objects[0].items.length, 2)
      })
  },
  "reference expansions": function () {
    var query = {
      "trellis": "item",
      "expansions": [
        "owner"
      ]
    }

    return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard)
      .then((response) => {
        var objects = response.objects
//        console.log('reference expansions response', response)
        assert.equals(objects.length, 4)
        assert.equals(objects[0].owner.name, 'James')
      })
  },
  "filter paths": function () {
    var query = {
      "trellis": "item",
      "filters": [
        {
          "path": "owner.name",
          "value": "James"
        },
        {
          "path": "owner.tags.name",
          "value": "male"
        },
        {
          "path": "owner.items.name",
          "value": "book of fairytales"
        }
      ]
    }
    var query2 = {
      "trellis": "item",
      "filters": [
        {
          "path": "owner.tags.name",
          "value": "female"
        }
      ]
    }

    return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard)
      .then((response) => {
        var objects = response.objects
//        console.log('response', response)
        assert.equals(objects.length, 2)
        assert.equals(objects[0].owner, 1)
        assert.equals(objects[1].owner, 1)
      })
//      .then(()=> Irrigation.query(query2, fixture.users['cj'], ground, lab.vineyard))
//      .then((response) => {
//        var objects = response.objects
//        console.log('response', response)
//        assert.equals(objects.length, 2)
//        assert.equals(objects[0].owner, 1)
//        assert.equals(objects[1].owner, 1)
//      })
  }
//  ,
//  "paths_to_tree": function () {
//    var lists = [
//      ['a'],
//      ['a', 'b'],
//      ['a', 'c'],
//      ['dog', 'b'],
//      ['dog']
//    ]
//    var tree = Ground.Join.paths_to_tree(lists)
//    console.log('tree', tree)
//    assert.equals(Object.keys(tree).length, 2)
//    assert.equals(Object.keys(tree['a']).length, 2)
//    assert.equals(Object.keys(tree['dog']).length, 1)
//  }
})


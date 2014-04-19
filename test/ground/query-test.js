var buster = require("buster");
var assert = buster.referee.assert;
var when = require("when");
var PlantLab = require('vineyard-plantlab');
process.chdir('..');
var lab = new PlantLab('config/server.json', ['lawn', 'fortress']);
var ground = lab.ground;
var Fixture = require('../Fixture.js');
var fixture = new Fixture.Fixture(lab);
ground.log_queries = true;

var Lawn = require('vineyard-lawn');
var Irrigation = Lawn.Irrigation;

var Ground = require('vineyard-ground');

lab.test("Query test", {
    setUp: function () {
        this.timeout = 5000;

        return fixture.prepare_database().then(function () {
            return fixture.populate();
        }).then(function () {
            return fixture.populate_characters();
        });
    },
    "multiple filters": function () {
        console.log('multiple filters');
        var socket;
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
        };

        return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard).then(function (response) {
            var objects = response.objects;
            console.log('objects', objects);
            assert.equals(objects.length, 1);
        });
    },
    "pager": function () {
        console.log('pager');
        var socket;
        var query = {
            "trellis": "character",
            "pager": {
                "limit": 2,
                "offset": 1
            }
        };

        return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard).then(function (response) {
            var objects = response.objects;

            assert.equals(objects.length, 2);
            assert.equals(response.total, 5);
        });
    },
    "list expansions": function () {
        var query = {
            "trellis": "character",
            "expansions": [
                "items"
            ]
        };

        return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard).then(function (response) {
            var objects = response.objects;

            assert.equals(objects.length, 5);
            assert.equals(objects[0].items.length, 2);
        });
    },
    "reference expansions": function () {
        var query = {
            "trellis": "item",
            "expansions": [
                "owner"
            ]
        };

        return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard).then(function (response) {
            var objects = response.objects;

            assert.equals(objects.length, 4);
            assert.equals(objects[0].owner.name, 'James');
        });
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
        };
        var query2 = {
            "trellis": "item",
            "filters": [
                {
                    "path": "owner.tags.name",
                    "value": "female"
                }
            ]
        };

        return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard).then(function (response) {
            var objects = response.objects;

            assert.equals(objects.length, 2);
            assert.equals(objects[0].owner, 1);
            assert.equals(objects[1].owner, 1);
        });
    }
});
//# sourceMappingURL=query-test.js.map

var buster = require("buster");
var assert = buster.referee.assert;
var when = require("when");
var PlantLab = require('vineyard-plantlab');

var lab = new PlantLab('config/server.json', ['lawn', 'fortress']);
var ground = lab.ground;
var Fixture = require('../Fixture.js');
var fixture = new Fixture.Fixture(lab);
ground.log_queries = true;

var Lawn = require('vineyard-lawn');
var Irrigation = Lawn.Irrigation;

lab.test("Query test", {
    setUp: function () {
        this.timeout = 8000;

        return fixture.prepare_database().then(function () {
            return fixture.populate();
        }).then(function () {
            return fixture.populate_characters();
        });
    },
    tearDown: function () {
    },
    "multiple filters": function () {
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
    }
});
//# sourceMappingURL=query-test.js.map

var buster = require("buster");
var assert = buster.referee.assert;
var when = require("when");
var pipeline = require('when/pipeline');
var PlantLab = require('vineyard-plantlab');
var lab = new PlantLab('config/server.json', ['lawn', 'fortress']);
var ground = lab.ground;
var Fixture = require('../Fixture.js');
var fixture = new Fixture.Fixture(lab);
ground.log_queries = true;

var Lawn = require('vineyard-lawn');
var Irrigation = Lawn.Irrigation;
var Ground = require('vineyard-ground');
var fortress = lab.vineyard.bulbs.fortress;
var Query_Builder = Ground.Query_Builder;

lab.test("Query test", {
    setUp: function () {
        this.timeout = 7000;
        return fixture.prepare_database().then(function () {
            return fixture.populate();
        }).then(function () {
            return fixture.populate_characters();
        });
    },
    "first": function () {
        var socket;
        var query = Query_Builder.create(ground, {
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
        });

        return fortress.query_access(fixture.users['froggy'], query).then(function (result) {
            console.log('result', result);
            assert.equals(result.walls.length, 1);
        });
    }
});
//# sourceMappingURL=fortress-test.js.map

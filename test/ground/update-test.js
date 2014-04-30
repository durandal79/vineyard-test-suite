var buster = require("buster");
var assert = buster.referee.assert;
var when = require("when");
var PlantLab = require('vineyard-plantlab');
var lab = new PlantLab('config/server.json', ['lawn', 'fortress']);
var ground = lab.ground;
var Fixture = require('../Fixture.js');
var fixture = new Fixture.Fixture(lab);
ground.log_queries = true;

var pipeline = require('when/pipeline');
var Lawn = require('vineyard-lawn');
var Irrigation = Lawn.Irrigation;

var Ground = require('vineyard-ground');

lab.test("Query test", {
    setUp: function () {
        this.timeout = 7000;

        return fixture.prepare_database().then(function () {
            return lab.start();
        }).then(function () {
            return fixture.populate();
        }).then(function () {
            return fixture.populate_characters();
        });
    },
    tearDown: function () {
        return lab.stop();
    },
    "remove": function () {
        var socket;
        var update = {
            objects: [
                {
                    "trellis": "user",
                    "id": 7,
                    "followers": [
                        {
                            "id": 9,
                            "_removed_": true
                        }
                    ]
                }
            ]
        };
        var query = {
            "trellis": "user",
            "expansions": ["followers"],
            "filters": [
                {
                    "path": "id",
                    "value": 7
                }
            ]
        };

        return pipeline([
            function () {
                return lab.login_socket('cj', 'pass');
            },
            function (s) {
                return socket = s;
            },
            function () {
                return lab.emit(socket, 'update', update);
            },
            function () {
                return lab.emit(socket, 'query', query).then(function (response) {
                    var objects = response.objects;
                    console.log('response', response);
                    assert.equals(objects.length, 1);
                    assert.equals(objects[0].followers.length, 0);
                });
            }
        ]);
    },
    "complex cross table": function () {
        var socket;
        var update = {
            objects: [
                {
                    "trellis": "user",
                    "id": 9,
                    "followers": [12]
                }
            ]
        };
        var query = {
            "trellis": "user",
            "expansions": ["followees"],
            "filters": [
                {
                    "path": "id",
                    "value": 12
                }
            ]
        };

        return pipeline([
            function () {
                return lab.login_socket('cj', 'pass');
            },
            function (s) {
                return socket = s;
            },
            function () {
                return lab.emit(socket, 'update', update);
            },
            function () {
                return lab.emit(socket, 'query', query).then(function (response) {
                    var objects = response.objects;

                    assert.equals(objects.length, 1);
                    assert.equals(objects[0].followees.length, 1);
                    assert.equals(objects[0].followees[0].name, "froggy");
                });
            }
        ]);
    }
});
//# sourceMappingURL=update-test.js.map

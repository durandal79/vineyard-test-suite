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
        this.timeout = 70000;

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
                },
                {
                    "trellis": "user",
                    "id": 7,
                    "followees": [9]
                }
            ]
        };
        var query = {
            "trellis": "user",
            "expansions": ["followers"],
            "filters": [
                {
                    "path": "id",
                    "value": 9
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
                    assert.equals(objects[0].followers.length, 2);
                    assert.equals(objects[0].followers[1].name, "hero");
                    assert.equals(objects[0].follower_count, 2);
                });
            }
        ]);
    },
    "counts": function () {
        var query = {
            "trellis": "character",
            "filters": [
                {
                    "path": "name",
                    "value": "James"
                }
            ]
        };

        var update1 = {
            "objects": [
                {
                    "trellis": "item",
                    "id": 25,
                    "owner": 1,
                    "name": "syringe"
                }
            ]
        };

        var update2 = {
            "objects": [
                {
                    "trellis": "item",
                    "id": 25,
                    "_deleted_": true
                }
            ]
        };

        return pipeline([
            function () {
                return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard);
            },
            function (response) {
                var objects = response.objects;
                console.log('response', response);
                assert.equals(objects[0].item_count, 2);
            },
            function () {
                return Irrigation.update(update1, fixture.users['cj'], ground, lab.vineyard);
            },
            function () {
                return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard);
            },
            function (response) {
                var objects = response.objects;
                console.log('response', response);
                assert.equals(objects[0].item_count, 3);
            },
            function () {
                return Irrigation.update(update2, fixture.users['cj'], ground, lab.vineyard);
            },
            function () {
                return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard);
            },
            function (response) {
                var objects = response.objects;
                console.log('response', response);
                assert.equals(objects[0].item_count, 2, 'Deleting item updated item count.');
            }
        ]);
    },
    "=>join counts": function () {
        var query = {
            "trellis": "user",
            "filters": [
                {
                    "path": "name",
                    "value": "cj"
                }
            ]
        };

        var update1 = {
            "objects": [
                {
                    "trellis": "user",
                    id: 12,
                    followees: [7]
                }
            ]
        };

        var update2 = {
            "objects": [
                {
                    "trellis": "user",
                    id: 12,
                    followees: [
                        {
                            id: 7,
                            _removed_: true
                        }
                    ]
                }
            ]
        };

        return pipeline([
            function () {
                return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard);
            },
            function (response) {
                var objects = response.objects;
                console.log('response', response);
                assert.equals(objects[0].follower_count, 1);
                assert.equals(objects[0].character_count, 3);
                assert.equals(objects[0].multi_count, 4);
            },
            function () {
                return Irrigation.update(update1, fixture.users['cj'], ground, lab.vineyard);
            },
            function () {
                return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard);
            },
            function (response) {
                var objects = response.objects;
                console.log('response', response);
                assert.equals(objects[0].follower_count, 2);
                assert.equals(objects[0].character_count, 3);
                assert.equals(objects[0].multi_count, 5);
            },
            function () {
                return Irrigation.update(update2, fixture.users['cj'], ground, lab.vineyard);
            },
            function () {
                return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard);
            },
            function (response) {
                var objects = response.objects;
                console.log('response', response);
                assert.equals(objects[0].follower_count, 1);
                assert.equals(objects[0].character_count, 3);
                assert.equals(objects[0].multi_count, 4);
            }
        ]);
    }
});
//# sourceMappingURL=update-test.js.map

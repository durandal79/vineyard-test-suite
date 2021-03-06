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

lab.test("Query test", {
    setUp: function () {
        this.timeout = 7000;

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
    "immediate cross-table query": function () {
        var query = ground.create_query('user');
        query.add_key_filter(7);
        query.add_subquery('roles');
        return query.run_single().then(function (user) {
            assert(user.name, 'cj');
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
    },
    "circular cross table": function () {
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

        return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard).then(function (response) {
            var objects = response.objects;

            assert.equals(objects.length, 1);
            assert.equals(objects[0].followers.length, 1);
            assert.equals(objects[0].followers[0].name, "froggy");
        });
    },
    "like": function () {
        var query = {
            "trellis": "user",
            "filters": [
                {
                    "path": "name",
                    "operator": "LIKE",
                    "value": "rog"
                }
            ]
        };

        return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard).then(function (response) {
            var objects = response.objects;

            assert.equals(objects.length, 1);
            assert.equals(objects[0].name, "froggy");
        });
    },
    "guids": function () {
        var guid = "2382e725-7fb9-4077-9c84-2ad709aa437d";
        var message = {
            "guid": guid,
            "text": "The System is not down."
        };
        var query = {
            "trellis": "message",
            "filters": [
                {
                    "path": "guid",
                    "value": guid
                }
            ]
        };

        return ground.insert_object('message', message).then(function () {
            return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard);
        }).then(function (response) {
            var objects = response.objects;
            console.log('response', response);
            assert.equals(objects.length, 1);
            assert.equals(objects[0].text, message.text);
        });
    },
    "multiple cross-tables": function () {
        var query = {
            "trellis": "character",
            "filters": [
                {
                    "path": "additional_tags",
                    "value": 4
                }
            ]
        };

        return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard).then(function (response) {
            var objects = response.objects;
            console.log('response', response);
            assert.equals(objects.length, 1);
        });
    },
    "map and union": function () {
        var query = {
            "trellis": "user",
            "map": {
                "is_alive": {
                    "type": "literal",
                    "value": true
                },
                "type": {
                    "type": "literal",
                    "value": 'user'
                },
                "username": {}
            },
            "filters": [
                {
                    "path": "id",
                    "value": 9
                }
            ]
        };
        var query2 = {
            "type": "union",
            "trellis": "user",
            "queries": [
                {
                    "trellis": "user",
                    "map": {
                        "is_alive": {
                            "type": "literal",
                            "value": true
                        },
                        "type": {
                            "type": "literal",
                            "value": "user"
                        },
                        "username": {
                            "type": "reference",
                            "path": "name"
                        },
                        "author": {
                            "type": "literal",
                            "value": null
                        }
                    }
                },
                {
                    "trellis": "character",
                    "expansions": ["author", "items"],
                    "map": {
                        "is_alive": {},
                        "type": {},
                        "username": {
                            "type": "reference",
                            "path": "name"
                        },
                        "author": {}
                    }
                }
            ],
            "sorts": [
                {
                    "property": "username"
                }
            ],
            "pager": {
                "limit": 7
            }
        };

        return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard).then(function (response) {
            var objects = response.objects;
            console.log('response', response);
            var user = objects[0];
            assert.equals(objects.length, 1);
            assert.equals(Object.keys(user).length, 4);
            assert.equals(user.id, 9);
            assert.equals(user.username, 'froggy');
            assert.same(user.is_alive, true);
        }).then(function () {
            return Irrigation.query(query2, fixture.users['cj'], ground, lab.vineyard);
        }).then(function (response) {
            var objects = response.objects;

            var user = objects[0];
            assert.equals(response.total, 8);
            assert.equals(objects.length, 7);
            assert.equals(objects[0].username, 'Adelle');
            assert.equals(typeof objects[0].author, 'object');
            assert.equals(objects[6].items.length, 2);
            assert.equals(objects[1].username, 'anonymous');
            assert.equals(objects[6].username, 'James');
            console.log('items', objects[6].items);
        });
    },
    "sorts": function () {
        var query = {
            "trellis": "item",
            "filters": [
                {
                    "path": "owner.name",
                    "operator": "LIKE",
                    "value": "a"
                }
            ],
            "sorts": [
                {
                    "path": "owner.name"
                },
                {
                    "path": "name"
                }
            ]
        };
        var query2 = {
            "trellis": "item",
            "sorts": [
                {
                    "path": "owner.name"
                },
                {
                    "path": "name"
                }
            ]
        };

        return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard).then(function (response) {
            var objects = response.objects;

            assert.equals(objects.length, 3);
            assert.equals(objects[0].name, 'crown');
            assert.equals(objects[1].name, "book of fairytales");
            assert.equals(objects[2].name, "knife");
        }).then(function () {
            return Irrigation.query(query2, fixture.users['cj'], ground, lab.vineyard);
        }).then(function (response) {
            var objects = response.objects;
            console.log('response', response);
            assert.equals(objects.length, 4);
            assert.equals(objects[0].name, 'crown');
            assert.equals(objects[1].name, 'shotgun');
            assert.equals(objects[2].name, "book of fairytales");
            assert.equals(objects[3].name, "knife");
        });
    },
    "null": function () {
        var query = {
            "trellis": "character",
            "filters": [
                {
                    "path": "name",
                    "operator": "!=",
                    "value": null
                }
            ],
            "sorts": [
                {
                    "path": "name"
                }
            ]
        };

        return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard).then(function (response) {
            var objects = response.objects;
            console.log('response', response);
            assert.greater(objects.length, 2);
        });
    },
    "subclasses": function () {
        var query = {
            "trellis": "object",
            "sorts": [
                {
                    "path": "name"
                }
            ]
        };

        return Irrigation.query(query, fixture.users['cj'], ground, lab.vineyard).then(function (response) {
            var objects = response.objects;
            console.log('response', response);
            assert.greater(objects.length, 2);
            assert.same(objects[0].is_alive, true);
            assert.same(objects[1].owner, 1);
        });
    }
});
//# sourceMappingURL=query-test.js.map

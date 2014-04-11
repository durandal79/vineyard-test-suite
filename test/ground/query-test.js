var buster = require("buster");
var assert = buster.referee.assert;
var when = require("when");
var PlantLab = require('vineyard-plantlab');
process.chdir('..');
var lab = new PlantLab('config/server.json', ['lawn', 'fortress']);
var ground = lab.ground;
var Fixture = require('../Fixture.js');
var fixture = new Fixture.Fixture(lab);

lab.test("Query test", {
    setUp: function () {
        this.timeout = 5000;

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
        return lab.login_socket('cj', 'pass').then(function (s) {
            return socket = s;
        }).then(function () {
            return lab.emit(socket, 'query', query);
        }).then(function (response) {
            var objects = response.objects;
            console.log('objects', objects);
            assert.equals(objects.length, 1);
        });
    }
});
//# sourceMappingURL=query-test.js.map

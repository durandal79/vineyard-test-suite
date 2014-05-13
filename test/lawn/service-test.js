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

var Ground = require('vineyard-ground');

lab.test("Query test", {
    setUp: function () {
        this.timeout = 10000;
        return fixture.prepare_database().then(function () {
            return lab.start();
        }).then(function () {
            return fixture.populate();
        }).then(function () {
            return fixture.populate_characters();
        });
    },
    tearDown: function () {
        console.log('stopping');
        return lab.stop();
    },
    "=>http query": function () {
        var login, query = {
            "trellis": "character"
        };
        return lab.login_http('cj', 'pass').then(function (s) {
            return login = s;
        }).then(function () {
            return console.log('login', login);
        }).then(function () {
            return lab.post('/vineyard/query', query, login);
        }).then(function (response) {
            console.log('response', response.content);
            var objects = response.content.objects;
            assert.equals(objects.length, 5);
            assert.equals(response.content.status, 200);
        });
    },
    "socket query": function () {
        var socket, query = {
            "trellis": "character"
        };
        return lab.login_socket('cj', 'pass').then(function (s) {
            return socket = s;
        }).then(function () {
            return lab.emit(socket, 'query', query);
        }).then(function (response) {
            console.log('response', response);
            var objects = response.objects;
            assert.equals(objects.length, 5);
        });
    }
});
//# sourceMappingURL=service-test.js.map

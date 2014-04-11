require('when/monitor/console');
var buster = require("buster");
var assert = buster.referee.assert;
var when = require("when");
var PlantLab = require('vineyard-plantlab');
process.chdir('..');
var lab = new PlantLab('config/server.json');
var ground = lab.ground;
var Fixture = require('../Fixture.js');
var fixture = new Fixture.Fixture(lab);
var pipeline = require('when/pipeline');
ground.log_queries = true;

lab.test("Solr test", {
    setUp: function () {
        this.timeout = 7000;
        return fixture.prepare_database().then(function () {
            return lab.start();
        }).then(function () {
            return lab.vineyard.bulbs['vineyard-solr'].clear();
        }).then(function () {
            return fixture.populate();
        }).then(function () {
            return fixture.populate_characters();
        });
    },
    tearDown: function () {
        lab.stop();
    },
    "=>query": function () {
        var socket;
        var query = {
            "trellis": "character",
            "filters": [
                {
                    "property": "all",
                    "operator": "solr",
                    "value": "Mr. Moss"
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
                return lab.emit(socket, 'query', query);
            },
            function (response) {
                console.log('response', response.objects);
                assert.equals(response.objects.length, 1);
            }
        ]);
    },
    "suggestions": function () {
        return pipeline([
            function () {
                return lab.get_json('/vineyard/solr/character/suggest?q=jam');
            },
            function (response) {
                console.log('response', response.objects);
                assert.equals(response.objects.length, 1);
            }
        ]);
    }
});
//# sourceMappingURL=solr-test.js.map

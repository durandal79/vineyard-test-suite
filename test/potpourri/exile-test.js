var buster = require("buster");
var assert = buster.referee.assert;
var when = require("when");
var PlantLab = require('vineyard-plantlab');
var lab = new PlantLab('config/server.json', ['lawn', 'fortress', 'exile', 'songbird']);
var ground = lab.ground;
var Fixture = require('../Fixture.js');
var fixture = new Fixture.Fixture(lab);
ground.log_queries = true;
var pipeline = require('when/pipeline');

var Lawn = require('vineyard-lawn');

var Ground = require('vineyard-ground');

lab.test("Exile test", {
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
    "ban": function () {
        var admin_socket, froggy_socket;
        var disconnected = false, notified = false, update = {
            objects: [
                {
                    trellis: "ban",
                    user: 9,
                    reason: 3
                }
            ]
        };

        return pipeline([
            function () {
                return lab.login_socket('cj', 'pass');
            },
            function (s) {
                return admin_socket = s;
            },
            function () {
                return lab.login_socket('froggy', 'pass');
            },
            function (s) {
                return froggy_socket = s;
            },
            function () {
                froggy_socket.on('banned', function () {
                    notified = true;
                });
                froggy_socket.on('disconnect', function () {
                    disconnected = true;
                });
            },
            function () {
                return lab.emit(admin_socket, 'update', update);
            },
            function () {
                var def = when.defer();
                setTimeout(function () {
                    return def.resolve();
                }, 1000);
                return def.promise;
            },
            function () {
                assert(notified, 'was notified');
                assert(disconnected, 'was disconnected');
            },
            function () {
                return lab.login_socket('froggy', 'pass');
            }
        ]);
    }
});
//# sourceMappingURL=exile-test.js.map

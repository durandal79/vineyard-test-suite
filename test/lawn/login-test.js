var buster = require("buster");
var assert = buster.referee.assert;

require('when/monitor/console');
var when = require("when");
var plantlab = require('vineyard-plantlab');
var lab = new plantlab('config/server.json', ['lawn', 'fortress']);
var ground = lab.ground;
var Fixture = require('../Fixture.js');
var fixture = new Fixture.Fixture(lab);
var pipeline = require('when/pipeline');

lab.test("Notification test", {
    setUp: function () {
        this.timeout = 10000;
        console.log('starting notification test');
        return fixture.prepare_database().then(function () {
            return lab.start();
        }).then(function () {
            return fixture.populate();
        });
    },
    tearDown: function () {
        return lab.stop();
    },
    "photo notifications": function () {
        var socket;
        var update = {
            objects: [
                {
                    "trellis": "character",
                    "name": "deleteme"
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
                return lab.emit(socket, 'room/join', 'event/7E6FB110-9B43-11E3-895F-CB7A0150F761');
            },
            function () {
                assert(true);
                return lab.emit(socket, 'update', update);
            }
        ]);
    }
});
//# sourceMappingURL=login-test.js.map

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

require('when/monitor/console');
var PlantLab = require('vineyard-plantlab');
var when = require('when');
var pipeline = require('when/pipeline');

var Fixture = (function (_super) {
    __extends(Fixture, _super);
    function Fixture() {
        _super.apply(this, arguments);
        this.users = {};
    }
    Fixture.prototype.populate = function () {
        var _this = this;
        var users = [
            {
                id: 2,
                name: 'anonymous',
                password: ''
            },
            {
                id: 7,
                name: 'cj',
                password: 'pass'
            },
            {
                id: 9,
                name: 'froggy',
                password: 'pass'
            },
            {
                id: 12,
                name: 'hero',
                password: 'pass'
            }
        ];

        this.users = {};
        for (var i in users) {
            var user = users[i];
            user['username'] = user.name;
            this.users[user.name] = user;
        }

        var inserts = users.map(function (user) {
            return _this.insert_object('user', user);
        });

        inserts.push(this.insert_object('role', { id: 1, name: "admin" }));
        inserts.push(this.ground.db.query("INSERT INTO roles_users (role, user) VALUES (1, 7)"));

        inserts.push(this.insert_object('role', { id: 2, name: "member" }));
        inserts.push(this.ground.db.query("INSERT INTO roles_users (role, user) VALUES (2, 9)"));
        inserts.push(this.ground.db.query("INSERT INTO roles_users (role, user) VALUES (2, 12)"));

        return when.all(inserts);
    };

    Fixture.prototype.populate_characters = function () {
        var _this = this;
        var inserts = [];

        var insert = function (data, user) {
            return inserts.push(function () {
                return _this.ground.insert_object('character', data, user);
            });
        };

        insert({ id: 1, name: "James", tags: ["male", "zombie"], is_alive: false }, this.users['cj']);
        insert({ id: 2, name: "Fugue", description: "James' sidekick.", tags: ["male"] }, this.users['cj']);
        insert({ id: 3, name: "Adelle" }, this.users['cj']);
        insert({ id: 4, name: "Adelle", "version": 2 }, this.users['cj']);
        insert({ id: 5, name: "Mr. Mosspuddle" }, this.users['froggy']);
        insert({ id: 6, name: "The Raven" }, this.users['froggy']);

        return pipeline(inserts);
    };
    return Fixture;
})(PlantLab.Fixture);
exports.Fixture = Fixture;
//# sourceMappingURL=Fixture.js.map

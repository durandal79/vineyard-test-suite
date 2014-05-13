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

        var admin = {
            id: 1,
            name: 'admin'
        };

        var member = {
            id: 2,
            name: 'member'
        };

        inserts.push(this.insert_object('role', { id: 1, name: "admin" }));
        inserts.push(this.add_role('cj', admin));

        inserts.push(this.insert_object('role', { id: 2, name: "member" }));
        inserts.push(this.add_role('froggy', member));
        inserts.push(this.add_role('hero', member));
        inserts.push(this.ground.db.query("INSERT INTO user_follows (follower, followee) VALUES (9, 7)"));

        return when.all(inserts);
    };

    Fixture.prototype.add_role = function (user_name, role) {
        var user = this.users[user_name];
        user.roles = user.roles || [];
        user.roles.push(role);
        return this.ground.db.query("INSERT INTO roles_users (role, user) VALUES (?, ?)", [role.id, user.id]);
    };

    Fixture.prototype.populate_tags = function () {
        var _this = this;
        var tags = [
            'male',
            'female',
            'zombie',
            'human',
            'bird'
        ];
        var inserts = tags.map(function (tag) {
            return function () {
                return _this.ground.insert_object('tag', { name: tag }, _this.users['cj']);
            };
        });
        return pipeline(inserts);
    };

    Fixture.prototype.populate_characters = function () {
        var _this = this;
        var inserts = [];

        var insert = function (data, user) {
            return inserts.push(function () {
                return _this.ground.insert_object('character', data, user);
            });
        };

        insert({ id: 1, name: "James", tags: [1, 3], is_alive: false }, this.users['cj']);
        insert({ id: 2, name: "Fugue", description: "James' sidekick.", tags: [1] }, this.users['cj']);
        insert({ id: 3, name: "Adelle", tags: [2], author: 7 }, this.users['cj']);
        insert({ id: 4, name: "Mr. Mosspuddle" }, this.users['froggy']);
        insert({ id: 5, name: "The Raven", additional_tags: [4] }, this.users['froggy']);

        return this.populate_tags().then(function () {
            return pipeline(inserts);
        }).then(function () {
            return _this.populate_items();
        });
    };

    Fixture.prototype.populate_items = function () {
        var _this = this;
        var inserts = [];

        var insert = function (data) {
            return inserts.push(function () {
                return _this.ground.insert_object('item', data, _this.users['cj']);
            });
        };

        insert({ id: 21, name: "knife", owner: 1 });
        insert({ id: 22, name: "book of fairytales", owner: 1 });
        insert({ id: 23, name: "shotgun", owner: 2 });
        insert({ id: 24, name: "crown", owner: 3 });

        return pipeline(inserts);
    };
    return Fixture;
})(PlantLab.Fixture);
exports.Fixture = Fixture;
//# sourceMappingURL=Fixture.js.map

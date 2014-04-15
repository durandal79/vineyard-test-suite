/// <reference path="../node_modules/vineyard-ground/ground.d.ts"/>
/// <reference path="../node_modules/vineyard-plantlab/plantlab.d.ts"/>
declare function require(name:string):any;

require('when/monitor/console');
import PlantLab = require('vineyard-plantlab')
var when = require('when')
var pipeline = require('when/pipeline')

export class Fixture extends PlantLab.Fixture {
  users = {}

  populate():Promise {
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
    ]

    this.users = {}
    for (var i in users) {
      var user = users[i]
      user['username'] = user.name
      this.users[user.name] = user
    }

    var inserts = users.map((user)=> this.insert_object('user', user))

    inserts.push(this.insert_object('role', {id: 1, name: "admin"}))
    inserts.push(this.ground.db.query("INSERT INTO roles_users (role, user) VALUES (1, 7)"))

    inserts.push(this.insert_object('role', {id: 2, name: "member"}))
    inserts.push(this.ground.db.query("INSERT INTO roles_users (role, user) VALUES (2, 9)"))
    inserts.push(this.ground.db.query("INSERT INTO roles_users (role, user) VALUES (2, 12)"))

    return when.all(inserts)
  }

  populate_characters():Promise {
    var inserts = []

    var insert = (data, user)=> inserts.push(()=> this.ground.insert_object('character', data, user))

    insert({id: 1, name: "James", tags: [ "male", "zombie" ], is_alive: false }, this.users['cj'])
    insert({id: 2, name: "Fugue", description: "James' sidekick.", tags: [ "male" ]}, this.users['cj'])
    insert({id: 3, name: "Adelle"}, this.users['cj'])
    insert({id: 4, name: "Adelle", "version": 2}, this.users['cj'])
    insert({id: 5, name: "Mr. Mosspuddle"}, this.users['froggy'])
    insert({id: 6, name: "The Raven"}, this.users['froggy'])

    return pipeline(inserts)
      .then(()=> this.populate_items())
  }

  populate_items():Promise {
    var inserts = []

    var insert = (data, user)=> inserts.push(()=> this.ground.insert_object('item', data, user))

    insert({id: 21, name: "knife", owner: 1 }, this.users['cj'])
    insert({id: 22, name: "book of fairytales", owner: 1 }, this.users['cj'])
    insert({id: 23, name: "shotgun", owner: 2 }, this.users['cj'])

    return pipeline(inserts)
  }


}

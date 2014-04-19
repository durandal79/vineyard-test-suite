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

    var admin = {
      id: 1,
      name: 'admin'
    }

    var member = {
      id: 2,
      name: 'member'
    }

    inserts.push(this.insert_object('role', {id: 1, name: "admin"}))
//    inserts.push(this.ground.db.query("INSERT INTO roles_users (role, user) VALUES (1, 7)"))
    inserts.push(this.add_role('cj', admin))

    inserts.push(this.insert_object('role', {id: 2, name: "member"}))
    inserts.push(this.add_role('froggy', member))
    inserts.push(this.add_role('hero', member))
//    inserts.push(this.ground.db.query("INSERT INTO roles_users (role, user) VALUES (2, 12)"))
//    inserts.push(this.ground.db.query("INSERT INTO roles_users (role, user) VALUES (2, 9)"))

    return when.all(inserts)
  }

  add_role(user_name, role):Promise {
    var user = this.users[user_name]
    user.roles = user.roles || []
    user.roles.push(role)
    return this.ground.db.query("INSERT INTO roles_users (role, user) VALUES (?, ?)", [role.id, user.id])
  }

  populate_tags():Promise {
    var tags = [
      'male',
      'female',
      'zombie',
      'human'
    ]
    var inserts = tags.map((tag)=> ()=> this.ground.insert_object('tag', {name: tag }, this.users['cj']))
    return pipeline(inserts)
  }

  populate_characters():Promise {
    var inserts = []

    var insert = (data, user)=> inserts.push(()=> this.ground.insert_object('character', data, user))

    insert({id: 1, name: "James", tags: [ 1, 3 ], is_alive: false }, this.users['cj'])
    insert({id: 2, name: "Fugue", description: "James' sidekick.", tags: [ 1 ]}, this.users['cj'])
    insert({id: 3, name: "Adelle", tags: [ 2 ]}, this.users['cj'])
    insert({id: 4, name: "Mr. Mosspuddle"}, this.users['froggy'])
    insert({id: 5, name: "The Raven"}, this.users['froggy'])

    return this.populate_tags()
      .then(()=> pipeline(inserts))
      .then(()=> this.populate_items())
  }

  populate_items():Promise {
    var inserts = []

    var insert = (data)=> inserts.push(()=> this.ground.insert_object('item', data, this.users['cj']))

    insert({id: 21, name: "knife", owner: 1 })
    insert({id: 22, name: "book of fairytales", owner: 1 })
    insert({id: 23, name: "shotgun", owner: 2 })
    insert({id: 24, name: "crown", owner: 3 })

    return pipeline(inserts)
  }


}

/// <reference path="../node_modules/ground/ground.d.ts"/>
/// <reference path="../node_modules/plantlab/plantlab.d.ts"/>
declare function require(name:string):any;

require('when/monitor/console');
import PlantLab = require('plantlab')
var when = require('when')
var pipeline = require('when/pipeline')

export class Fixture extends PlantLab.Fixture {
  users = {}

  populate():Promise {
    return when.resolve()
  }

}

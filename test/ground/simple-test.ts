/// <reference path="../../node_modules/vineyard-plantlab/plantlab.d.ts"/>
var buster = require("buster");
var assert = buster.referee.assert;
var when = require('when')

buster.testCase("Simple test", {
  setUp: function () {
    this.timeout = 10000;
  },
  "always true": function () {
    assert(true)
  },
  "promise": function () {
    var def = when.defer()
    setTimeout(function() {
      assert(true)
      def.resolve()
    }, 10)
    return def.promise
  }
})
var config = module.exports;

config["Vineyard tests"] = {
  env: "node",
  tests: [
    "test/ground/*-test.js",
    "test/lawn/*-test.js"
  ]
};

var config = module.exports;

config["Vineyard tests"] = {
    env: "node",
    rootPath: "../",
    sources: [
//        "lib/mylib.js",    // Paths are relative to config file
//        "lib/**/*.js"      // Glob patterns supported
    ],
    tests: [
        "test/tests/*-test.js"
    ]
};

// Add more configuration groups as needed
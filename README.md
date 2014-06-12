# Vineyard Test Suite #

A project for developing and testing the main Vineyard framework and bulbs (modules).

## Installation ##

1. Clone https://github.com/silentorb/vineyard-test-suite
2. (Optional) Rename the `vineyard-test-suite` folder to `vineyard`
3. Run `npm install` inside the vineyard folder.  That will create a node_modules folder.
4. Inside the new node_modules folder, clone at least the following repositories or forks:
  * MetaHub - https://github.com/silentorb/metahub_js
  * Ground - https://github.com/silentorb/ground_js
  * Vineyard - https://github.com/silentorb/vineyard
  * Lawn - https://github.com/silentorb/lawn
  * PlantLab - https://github.com/silentorb/plantlab
5. Copy `config/server-sample.json` to `config/server.json`
6. Open `config/server.json` and change the db settings to point to an existing local database.
    (Note, the tables in this database will be regularly dropped and recreated by the Vineyard tests.)
7. (Optional) You can run `node scripts/db.js` from the test suite root to rebuild the database and check
     that the connection is working.

## Development ##

Any changes to TypeScript files in the vineyard modules will require specialized compilation.
To do this, run `grunt`.  This will watch all of the TypeScript files and recompile the modules as needed.

## Testing ##

The Vineyard tests use Buster.js.  The test folder structure is organized by test/*module name*/something-test.js.

To run a single test file, such as the query test suite for ground, run `node test/ground/query-test.js`.

To run the majority of tests run `buster-test`.
Some test files aren't included in this bulk test because they are too fragile and specific.

You can also run individual tests using buster-test, but there are some cases where buster-test will catch and
hide errors that won't be hidden when running the test straight through node.

## Running ##

Type `node run.js` to fire up the Vineyard server apart from a test.
This can be useful to quickly see if the server is able to start and if you want to manually test something
such as through generating HTTP requests through a browser.
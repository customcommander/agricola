#!/bin/sh
# this script is executed via `npm test` from the project root directory,
# so paths are relative from the root.

npx cucumber-js --config test/cucumber.js test/features
npx cucumber-js --config test/cucumber.js --profile predefined_setup test/features
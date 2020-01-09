#!/bin/bash

set -e

#-------------------------------------------------------------------------------
# Change in template directory
#-------------------------------------------------------------------------------
cd test-integration/samples/$1
echo "*** changed directory in : test-integration/samples/"$1


#-------------------------------------------------------------------------------
# Run unit test 
#-------------------------------------------------------------------------------
echo "*** run unit test in client for : "$1
npm run lint:fix && npm test
echo "*** run unit test in server for : "$1
cd server && npm run lint:fix && npm test
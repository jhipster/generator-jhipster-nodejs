#!/bin/bash

set -e

RED='\033[0;31m'


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
if [ $? -ne 0 ]; then
  echo "${RED}failed server unit test command"
  exit 1
fi
echo "*** run unit test in server for : "$1
cd server && npm run lint:fix && npm test
if [ $? -ne 0 ]; then
  echo "${RED}failed client unit test command"
  exit 1
fi
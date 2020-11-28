#!/bin/sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'

#-------------------------------------------------------------------------------
# Change in template directory
#-------------------------------------------------------------------------------
cd test-integration/samples/$1
echo "***${GREEN}changed directory in : test-integration/samples/"$1


#-------------------------------------------------------------------------------
# Run unit test
#-------------------------------------------------------------------------------
echo "*** run unit test in client for : "$1
npm run lint:fix && npm test
if [ $? -ne 0 ]; then
  echo "${RED}FAILED CLIENT UNIT TEST COMMAND"
  exit 1
fi
echo "*** run unit test in server for : "$1
cd server && npm run lint:fix && npm test
if [ $? -ne 0 ]; then
  echo "${RED}FAILED SERVER UNIT TEST COMMAND"
  exit 1
fi

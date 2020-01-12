#!/bin/bash

set -e

RED='\033[0;31m'


#-------------------------------------------------------------------------------
# Change in template directory
#-------------------------------------------------------------------------------
cd test-integration/samples/$1
echo "*** changed directory in : test-integration/samples/"$1


#-------------------------------------------------------------------------------
# Run e2e test 
#-------------------------------------------------------------------------------
echo "*** run e2e test in server for : "$1
cd server && npm run test:e2e
if [ $? -ne 0 ]; then
  echo "${RED}FAILED SERVER E2E TEST COMMAND"
  exit 1
fi
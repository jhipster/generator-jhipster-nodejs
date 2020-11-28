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
# Link nodejs blueprint in folder
#-------------------------------------------------------------------------------
echo "*** link nodejs blueprint in : test-integration/samples/"$1
sudo npm link generator-jhipster-nodejs


#-------------------------------------------------------------------------------
# Generate component (service or controller)
# $2 : service or controller
# $3 : name
#-------------------------------------------------------------------------------
echo "*** run generation" $2 $3 "with nodejs blueprint for : "$1

componentGenerator="spring-$2 $3"
runOptions="$componentGenerator --blueprints nodejs --force"

jhipster $runOptions

echo "*** check if the "$2 "generation is wrong :"

if [ -z $(find server/src -type f -name "$3.$2.ts" ) ]; then
      echo "${RED}WRONG GENERATION"
      exit 1
else
      echo "${GREEN}GENERATION OK"
fi

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
# echo "*** link nodejs blueprint in : test-integration/samples/"$1
# sudo npm link generator-jhipster-nodejs

#-------------------------------------------------------------------------------
# Run NHipster Generator
#-------------------------------------------------------------------------------
echo "*** run generation app with nodejs blueprint for : "$1

runOptions="--blueprints nodejs --skip-checks --force --no-insight --skip-install"

if [ "$2" = "import-jdl" ]; then
  runOptions="import-jdl "$1".jdl $runOptions"
fi

jhipster $runOptions

if [ "$2" = "post-import-jdl" ]; then
  echo "*** run import jdl after generation for : "$1
  jhipster import-jdl $1.jdl $runOptions
fi

echo "*** check if the generation is wrong for some default java classes created :"

if [ -z $(find src -type f -name "*.java" ) ]; then
      echo "${GREEN}GENERATION OK"
else
      echo "${RED}WRONG GENERATION"
      exit 1
fi



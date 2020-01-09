#!/bin/bash

set -e


#-------------------------------------------------------------------------------
# Change in template directory
#-------------------------------------------------------------------------------
cd test-integration/samples/$1
echo "*** changed directory in : test-integration/samples/"$1


#-------------------------------------------------------------------------------
# Run NHipster Generator
#-------------------------------------------------------------------------------
echo "*** run nodejs blueprint for : "$1

runOptions="--blueprints nodejs --skip-git --skip-checks --force --no-insight --skip-install"

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
      echo "generation ok"
else
      echo "wrong generation"
      exit 1
fi

echo "*** install client dependencies for : "$1
sudo npm install
if [ $? -ne 0 ]; then
        echo "*** failed client install"
        exit 1
fi
echo "*** install server dependencies for : "$1
cd server && sudo npm install
if [ $? -ne 0 ]; then
        echo "*** failed server install"
        exit 1
fi

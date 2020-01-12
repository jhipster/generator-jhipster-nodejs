#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'


#-------------------------------------------------------------------------------
# Change in template directory
#-------------------------------------------------------------------------------
cd test-integration/samples/$1
echo "*** changed directory in : test-integration/samples/"$1


#-------------------------------------------------------------------------------
# Generate component (service or controller)
# $2 : service or controller
# $3 : name
#-------------------------------------------------------------------------------
echo "*** run generation" $2 $3 "with nodejs blueprint for : "$1

componentGenerator="spring-"$2 $3
runOptions="--blueprints nodejs --skip-git --skip-checks --force --no-insight --skip-install"

jhipster $componentGenerator $runOptions

echo "*** check if the "$2 "generation is wrong for some default java classes created :"

if [ -z $(find src -type f -name "*.java" ) ]; then
      echo "${GREEN}GENERATION OK"
else
      echo "${RED}WRONG GENERATION"
      exit 1
fi
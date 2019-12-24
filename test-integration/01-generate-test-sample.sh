#!/bin/bash

set -e

launchCurl() {
    sleep 80
    retryCount=1
    maxRetry=10
    httpUrl="http://localhost:8081/management/info"
    rep=$(curl -v "$httpUrl")
    status=$?
    while [ "$status" -ne 0 ] && [ "$retryCount" -le "$maxRetry" ]; do
        echo "*** [$(date)] Application not reachable yet. Sleep and retry - retryCount =" $retryCount "/" $maxRetry
        retryCount=$((retryCount+1))
        sleep 10
        rep=$(curl -v "$httpUrl")
        status=$?
    done

    if [ "$status" -ne 0 ]; then
        echo "*** [$(date)] Not connected after" $retryCount " retries."
        exit 1
    fi
}

runApp() {
    npm run start:app &
    echo $! > .pidRunApp
}


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
npm install
echo "*** install server dependencies for : "$1
cd server && npm install


#-------------------------------------------------------------------------------
# Run and test app
#-------------------------------------------------------------------------------
echo "*** run app : "$1
cd ..
runApp
launchCurl


#-------------------------------------------------------------------------------
# Kill app
#-------------------------------------------------------------------------------
echo "*** kill app : "$1
kill $(cat .pidRunApp)

#!/bin/bash

set -e

RED='\033[0;31m'

launchCurl() {
    if [ "$2" = "build" ]; then
      sleep 10
    else
      sleep 100
    fi
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
        echo "${RED}[$(date)] Not connected after" $retryCount " retries."
        exit 1
    fi
}

runOnlyServerApp() {
    set NODE_ENV=dev&& node dist/main.js &
    echo $! > .pidRunApp
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
# Run and test app
#-------------------------------------------------------------------------------
if [ "$2" = "build" ]; then
  echo "*** only server build in : "$1
  cd server
  npm run build
  echo "*** run server main app in dist : "$1
  runOnlyServerApp
else
  echo "*** run full app in : "$1
  runApp
fi

launchCurl


#-------------------------------------------------------------------------------
# Run client e2e tests
#-------------------------------------------------------------------------------

if [ "$1" != "microservice-oauth2-jdl" ] && [  "$2" = "run" ]; then
    echo "*** run protractor e2e test in client for : "$1
      node node_modules/webdriver-manager/bin/webdriver-manager update --gecko false && JHI_E2E_HEADLESS=true npm run e2e
        if [ $? -ne 0 ]; then
            echo "${RED}FAILED PROTRACTOR CLIENT E2E TEST COMMAND"
            exit 1
        fi
fi


#-------------------------------------------------------------------------------
# Kill app
#-------------------------------------------------------------------------------
echo "*** kill app : "$1
kill $(cat .pidRunApp)

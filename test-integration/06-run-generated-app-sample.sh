#!/bin/bash

set -e

RED='\033[0;31m'
RUN_COMMAND='npm run start:app'

launchCurl() {
    sleep 100
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

runApp() {
     "${RUN_COMMAND}" &
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
  echo "*** build for : "$1
  RUN_COMMAND='set NODE_ENV=dev&& node server/dist/main'
  npm run build:app
fi
echo "*** run app : "$1
runApp
launchCurl


#-------------------------------------------------------------------------------
# Kill app
#-------------------------------------------------------------------------------
echo "*** kill app : "$1
kill $(cat .pidRunApp)

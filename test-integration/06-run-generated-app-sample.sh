#!/bin/bash

set -e

RED='\033[0;31m'

launchCurl() {
    if [ "$2" = "build" ]; then
      sleep 20
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
# Kill app
#-------------------------------------------------------------------------------
echo "*** kill app : "$1
kill $(cat .pidRunApp)

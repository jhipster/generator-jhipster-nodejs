#!/bin/bash

set -e

launchCurl() {
    sleep 100
    retryCount=1
    maxRetry=10
    httpUrl="http://localhost:8081/$1/management/health"
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
jhipster --blueprints nodejs --skip-git --skip-checks --force --no-insight --skip-server
echo "*** install server dependencies for : "$1
#cd server && npm install


#-------------------------------------------------------------------------------
# Run and test app
#-------------------------------------------------------------------------------
echo "*** run app : "$1
#cd ..
cat .yo-rc.json
runApp
launchCurl


#-------------------------------------------------------------------------------
# Kill app
#-------------------------------------------------------------------------------
echo "*** kill app : "$1
kill $(cat .pidRunApp)

#!/bin/sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'

#-------------------------------------------------------------------------------
# functions
#-------------------------------------------------------------------------------

launchCurlOrProtractor() {
    if [ "$1" = "build" ]; then
      sleep 10
    else
      sleep 150
    fi
    retryCount=1
    maxRetry=10
    httpUrl="http://localhost:8081/management/info"
    rep=$(curl -v "$httpUrl")
    status=$?
    while [ "$status" -ne 0 ] && [ "$retryCount" -le "$maxRetry" ]; do
        echo "*** [$(date)] Application not reachable yet. Sleep and retry - retryCount =" $retryCount "/" $maxRetry
        retryCount=$((retryCount+1))
        sleep 15
        rep=$(curl -v "$httpUrl")
        status=$?
    done

    if [ "$status" -ne 0 ]; then
        echo "***${RED}[$(date)] Not connected after" $retryCount " retries."
        return 1
    fi

    if [ "$1" = "oauth2" ] || [  "$1" = "jwt" ]; then

      retryCount=0
      maxRetry=1
      until [ "$retryCount" -ge "$maxRetry" ]
      do
        result=0
        echo "***${GREEN}run protractor e2e test in client for : "$1
        node node_modules/webdriver-manager/bin/webdriver-manager update --gecko false --versions.chrome 92.0.4515.43 && JHI_E2E_HEADLESS=true npm run e2e
        result=$?
        [ $result -eq 0 ] && break
        retryCount=$((retryCount+1))
        echo "***${RED}e2e tests failed... retryCount =" $retryCount "/" $maxRetry
        sleep 15
      done
      return $result

    else
     return 0
    fi
}


runOnlyServerApp() {
    echo "***${GREEN}node env : "$1
    BACKEND_ENV=$1 node dist/main.js &
    echo $! > .pidRunApp
}

runApp() {
    echo "***${GREEN}node env : "$1
    BACKEND_ENV=$1 npm run start:app &
    echo $! > .pidRunApp
}

#-------------------------------------------------------------------------------
# Change in template directory
#-------------------------------------------------------------------------------

cd test-integration/samples/$1
echo "***${GREEN}changed directory in : test-integration/samples/"$1


#-------------------------------------------------------------------------------
# Run and test app
#-------------------------------------------------------------------------------
ENV_BUILD="dev"
if [ "$1" = "monolith-client-database-prod-template-jdl" ]; then
echo "***${GREEN}set prod build environment"
ENV_BUILD="prod"
fi

if [ "$2" = "build" ]; then
  echo "***${GREEN}only server build in : "$1
  cd server
  npm run build
  echo "***${GREEN}run server main app in dist : "$1
  runOnlyServerApp $ENV_BUILD
else
  echo "***${GREEN}run full app in : "$1
  runApp $ENV_BUILD
fi

launchCurlOrProtractor $2
resultRunApp=$?

#-------------------------------------------------------------------------------
# Kill app
#-------------------------------------------------------------------------------
echo "***${GREEN}kill app : "$1
kill $(cat .pidRunApp)

exit $((resultRunApp))


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
# Install app dependencies
#-------------------------------------------------------------------------------

echo "*** install client dependencies for : "$1
sudo npm install
if [ $? -ne 0 ]; then
  echo "${RED}FAILED CLIENT INSTALL"
  exit 1
fi
echo "*** install server dependencies for : "$1
cd server && sudo npm install
if [ $? -ne 0 ]; then
  echo "${RED}FAILED SERVER INSTALL"
  exit 1
fi

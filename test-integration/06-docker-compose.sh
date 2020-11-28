#!/bin/sh

set -e

GREEN='\033[0;32m'


#-------------------------------------------------------------------------------
# Change in template directory
#-------------------------------------------------------------------------------

cd test-integration/samples/$1
echo "***${GREEN}changed directory in : test-integration/samples/"$1

#-------------------------------------------------------------------------------
# Run docker keycloak for oauth2 e2e tests
#-------------------------------------------------------------------------------

echo "***${GREEN}run docker compose keycloak"
docker-compose -f src/main/docker/keycloak.yml up -d

docker ps -a

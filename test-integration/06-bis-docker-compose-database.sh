#!/bin/bash

set -e

GREEN='\033[0;32m'


#-------------------------------------------------------------------------------
# Change in template directory
#-------------------------------------------------------------------------------

cd test-integration/samples/$1
echo "***${GREEN}changed directory in : test-integration/samples/"$1

#-------------------------------------------------------------------------------
# Run docker prod databasefor e2e tests
#-------------------------------------------------------------------------------

if [[ $2 =~ "mysql" ]]
then
	echo "***${GREEN}run docker compose mysql"
	docker-compose -f src/main/docker/mysql.yml up -d
fi

if [[ $2 =~ "mssql" ]]
then
    echo "***${GREEN}run docker compose mssql"
    docker-compose -f src/main/docker/mssql.yml up -d
    sleep 50
fi

if [[ $2 =~ "postgresql" ]]
then
    echo "***${GREEN}run docker compose postgresql"
    docker-compose -f src/main/docker/postgresql.yml up -d
fi

if [[ $2 =~ "mongodb" ]]
then
    echo "***${GREEN}run docker compose mongodb"
    docker-compose -f src/main/docker/mongodb.yml up -d
fi


docker ps -a

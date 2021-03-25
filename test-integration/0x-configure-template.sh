#!/bin/bash

set -e

GREEN='\033[0;32m'

#-------------------------------------------------------------------------------
# Change in template directory
#-------------------------------------------------------------------------------
cd test-integration/samples/$1
echo -e "***${GREEN}changed directory in : test-integration/samples/"$1



#-------------------------------------------------------------------------------
# Configure template
#-------------------------------------------------------------------------------

echo -e "${GREEN}This is a template app named: "$1

    if [[ $2 =~ "react" ]]
    then
        sed -i 's/REPLACE_CLIENT_FRAMEWORK/react/g' $1.jdl
        echo -e "${GREEN}Replace client in react"
    fi

    if [[ $2 =~ "angular" ]]
    then
        sed -i 's/REPLACE_CLIENT_FRAMEWORK/angularX/g' $1.jdl
        echo -e "${GREEN}Replace client in angular"
    fi

    if [[ $2 =~ "vue" ]]
    then
        sed -i 's/REPLACE_CLIENT_FRAMEWORK/vue/g' $1.jdl
        echo -e "${GREEN}Replace client in vue"
    fi

    if [[ $2 =~ "jwt" ]]
    then
        sed -i 's/REPLACE_AUTH/jwt/g' $1.jdl
        echo -e "${GREEN}Replace auth in jwt"
    fi

    if [[ $2 =~ "oauth2" ]]
    then
        sed -i 's/REPLACE_AUTH/oauth2/g' $1.jdl
        echo -e "${GREEN}Replace auth in oauth2"
    fi

    if [[ $2 =~ "mysql" ]]
    then
        sed -i 's/REPLACE_DATABASE_TYPE/sql/g' $1.jdl
        sed -i 's/REPLACE_PROD_DATABASE_TYPE/mysql/g' $1.jdl
        echo -e "${GREEN}Replace prod database in mysql"
    fi

    if [[ $2 =~ "mssql" ]]
    then
        sed -i 's/REPLACE_DATABASE_TYPE/sql/g' $1.jdl
        sed -i 's/REPLACE_PROD_DATABASE_TYPE/mssql/g' $1.jdl
        echo -e "${GREEN}Replace prod database in mssql"
    fi

    if [[ $2 =~ "postgresql" ]]
    then
        sed -i 's/REPLACE_DATABASE_TYPE/sql/g' $1.jdl
        sed -i 's/REPLACE_PROD_DATABASE_TYPE/postgresql/g' $1.jdl
        echo -e "${GREEN}Replace prod database in postgresql"
    fi

    if [[ $2 =~ "mongodb" ]]
    then
        sed -i 's/REPLACE_DATABASE_TYPE/mongodb/g' $1.jdl
        sed -i 's/REPLACE_PROD_DATABASE_TYPE/mongodb/g' $1.jdl
        echo -e "${GREEN}Replace prod database in mongodb"
    fi

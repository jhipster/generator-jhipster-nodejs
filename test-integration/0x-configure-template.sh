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

echo "${GREEN}This is a template app named: "$1

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

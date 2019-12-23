#!/bin/bash

set -e


#-------------------------------------------------------------------------------
# Install JHipster Generator
#-------------------------------------------------------------------------------

echo "*** generator-jhipster: use last version"
npm install -g generator-jhipster

#-------------------------------------------------------------------------------
# Install yeoman
#-------------------------------------------------------------------------------
echo "*** yeoman: use last version"
npm install -g yo


#-------------------------------------------------------------------------------
# Install NHipster
#-------------------------------------------------------------------------------

echo "*** generator-jhipster-nodejs: use current branch version"
npm install -g
# npm link
#!/bin/sh

set -e


#-------------------------------------------------------------------------------
# Install JHipster Generator
#-------------------------------------------------------------------------------

echo "*** generator-jhipster: use last supported version"
npm install -g generator-jhipster@7.0.0

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
# sudo npm link

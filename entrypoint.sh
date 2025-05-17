#!/bin/bash

#pwd
#
#ls -al

#ls -al node_modules/.bin
yarn install

if [ -d "./node_modules" ]; then
# Check if the DBG environment variable is set to "true"
if [ "$DBG" = "true" ]; then
  echo "Loading server in debug mode"
  node_modules/.bin/tsx --inspect-brk=0.0.0.0:9229 src/server.ts
else
  echo "Loading server in non-debug mode"
  node_modules/.bin/tsx src/server.ts
fi
else
    echo "==========  NO node_modules =============="
fi

/usr/bin/ping -c5 telstra.com
sleep infinity

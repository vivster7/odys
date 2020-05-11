#!/bin/bash

# Current directory of script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Import .env variables
set -a
[ -f "$DIR"/../.env ] && source "$DIR"/../.env
set +a

# start postgreset
postgrest "$DIR"/../postgrest.dev.conf &
POSTGREST_PID=$!

# wait for postgrest to start
sleep 1

# Read openapi schema hosted by postgrest server
FILENAME="openapi-odys-spec.json"
curl "$HOST:$PORT" > $FILENAME

# generate client
openapi-generator generate -i $FILENAME -g typescript-fetch -p typescriptThreePlus -o "$DIR"/../../client/src/generated

# cleanup
kill $POSTGREST_PID
rm $FILENAME
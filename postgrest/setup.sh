#!/bin/bash

# Current directory of script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

"$DIR"/scripts/teardown.sh
"$DIR"/scripts/configure_postgrest.sh
"$DIR"/scripts/generate_client.sh
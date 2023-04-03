#!/bin/bash

# Current directory of script
ROOT_DIR="$(git rev-parse --show-toplevel)"

"$ROOT_DIR/postgrest/scripts/teardown.sh"
"$ROOT_DIR/postgrest/scripts/configure_postgrest.sh"
"$ROOT_DIR/postgrest/scripts/generate_client.sh"
#!/bin/bash

ROOT_DIR="$(git rev-parse --show-toplevel)"

# Import .env variables
set -a
[ -f "$ROOT_DIR/postgrest/.env" ] && source "$ROOT_DIR/postgrest/.env"
[ -f "$ROOT_DIR/postgrest/.env.local" ] && source "$ROOT_DIR/postgrest/.env.local"
set +a

docker run --rm --network=host -v "$ROOT_DIR":/src openapitools/openapi-generator-cli generate -i http://localhost:3001 -g typescript-fetch -p typescriptThreePlus --model-name-prefix Odys -o /src/client/src/generated

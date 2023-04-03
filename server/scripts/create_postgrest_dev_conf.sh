#!/bin/bash

ROOT_DIR="$(git rev-parse --show-toplevel)"

# Import .env variables
set -a
[ -f "$ROOT_DIR/postgrest/.env" ] && source "$ROOT_DIR/postgrest/.env"
[ -f "$ROOT_DIR/postgrest/.env.local" ] && source "$ROOT_DIR/postgrest/.env.local"
set +a

# create postgrest.dev.conf file
cat >"$ROOT_DIR/postgrest/postgrest.dev.conf" <<EOF
# The standard connection URI
db-uri       = "postgres://$PG_USER:$PG_PASSWORD@$PG_HOST:$PG_PORT/$DATABASE"

# The name of which database schema to expose to REST clients
db-schema    = "$PG_SCHEMA"

# The database role to use when no client authentication is provided.
# Can (and should) differ from user in db-uri
db-anon-role = "$PG_ANON_USER"

## limit rows in response
## we should paginate if there are > 1000 rows
max-rows     = 1000

server-host  = "$HOST"
server-port  = "$PORT"
EOF

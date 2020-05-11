#!/bin/bash

# Current directory of script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Import .env variables
set -a
[ -f "$DIR"/../.env ] && source "$DIR"/../.env
set +a

# add roles to db cluster
psql -U postgres -c "create role $PG_ANON_USER nologin";
psql -U postgres -c "create role $PG_USER noinherit login password '$PG_PASSWORD';";

# make database
createdb "$DATABASE"

# create api schema + tables
psql -U postgres -d odys_dev < "$DIR"/../schema.ddl

# anon grant can access everything in api schema
psql -U postgres -d odys_dev -c "grant usage on schema $PG_SCHEMA to $PG_ANON_USER;"
psql -U postgres -d odys_dev -c "grant select, insert, update, delete on all tables in schema $PG_SCHEMA to $PG_ANON_USER;"

# authenticator can become anon (cannot login as anon directly)
psql -U postgres -d odys_dev -c "grant $PG_ANON_USER to $PG_USER;"

# create postgrest.dev.conf file
cat >"$DIR"/../postgrest.dev.conf <<EOF
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

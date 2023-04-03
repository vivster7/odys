#!/bin/bash

# Current directory of script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="$DIR/../.."

# Import .env variables
set -a
[ -f "$ROOT_DIR/postgrest/.env" ] && source "$ROOT_DIR/postgrest/.env"
[ -f "$ROOT_DIR/postgrest/.env.local" ] && source "$ROOT_DIR/postgrest/.env.local"
set +a

# add roles to db cluster
psql -U postgres -c "create role $PG_ANON_USER nologin";
psql -U postgres -c "create role $PG_USER noinherit login password '$PG_PASSWORD';";

# make database
createdb -U postgres "$DATABASE"

# create api schema + tables
psql -U postgres -d "$DATABASE" < "$ROOT_DIR/postgrest/schema.ddl"

# anon grant can access everything in api schema
psql -U postgres -d "$DATABASE" -c "grant usage on schema $PG_SCHEMA to $PG_ANON_USER;"
psql -U postgres -d "$DATABASE" -c "grant select, insert, update, delete on all tables in schema $PG_SCHEMA to $PG_ANON_USER;"

# authenticator can become anon (cannot login as anon directly)
psql -U postgres -d "$DATABASE" -c "grant $PG_ANON_USER to $PG_USER;"

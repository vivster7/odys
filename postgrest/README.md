Postgrest is used to host a REST API on top of a DB.

## New Installation
`docker compose up`
`docker compose exec db bash`
`/src/postgrest/setup.sh`
# TODO: Fix /src/postgrest/scripts/generate_client.sh

## Installation
`brew install postgrest`
`brew install openapi-generator` (used to generate clients)

## Quick Start
Assumes you are in the odys/postgrest directory.

Setup `.env` file from secrets

`./setup.sh`
`postgrest postgrest.dev.conf`

Its now working at:
`curl http://localhost:3001/`

For a UI of available endpoints:
`open index.html`

## Development
You can dump the existing schema file with `pg_dump -U postgres -h localhost odys_dev -s > schema.ddl`
If you make schema changes, update the `schema.ddl` file and run `./setup.sh` again.

## Migrations
Log on to SQL instance with Gcloud terminal
Switch to odys_production database:
`\c odys_production`

Add API schema to search_path:
`SET search_path to api, public;`

Run migration code:
`ALTER TABLE...`

Update any grants if necessary:
`GRANT * TO...`

Redeploy postgrest
`./scripts/deploy_production.sh`

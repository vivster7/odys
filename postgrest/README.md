Postgrest is used to host a REST API on top of a DB.

## Installation
`brew install postgrest`

## Quick Start
Assumes you are in the odys/postgrest directory.

Setup `.env` file from secrets

`./teardown.sh`
`./setup.sh`
`postgrest postgrest.dev.conf`
`curl http://localhost:3000/`

For a UI of available endpoints:
`open index.html`

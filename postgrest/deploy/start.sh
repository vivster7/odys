#!/bin/bash

# This will start the postgrest server + put the caddy reverse proxy in front of it.
# It is tightly coupled with the Dockerfile.

postgrest /etc/postgrest.conf&
caddy run --config caddy.json

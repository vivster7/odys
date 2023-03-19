# Define variables
.DEFAULT_GOAL := start
APP_NAME := odys
ROOT_DIR := $(shell git rev-parse --show-toplevel)

# Define targets
.PHONY: setup start

setup:
	docker compose up --detach db
	docker compose exec db /src/postgrest/scripts/teardown.sh
	docker compose exec db /src/postgrest/scripts/configure_postgrest.sh
	$(ROOT_DIR)/postgrest/scripts/create_postgrest_dev_conf.sh
	docker compose up --detach postgrest
	$(ROOT_DIR)/postgrest/scripts/generate_client.sh
	docker compose down
	cd $(ROOT_DIR)/client && yarn install
	cd $(ROOT_DIR)/server && yarn install
	

start:
	docker compose up


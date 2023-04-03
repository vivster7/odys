# Define variables
.DEFAULT_GOAL := start
APP_NAME := odys
ROOT_DIR := $(shell git rev-parse --show-toplevel)

# Define targets
.PHONY: setup start deploy-server

setup:
	docker compose up --detach db
	docker compose exec db /src/server/scripts/teardown.sh
	docker compose exec db /src/server/scripts/configure_postgrest.sh
	# $(ROOT_DIR)/server/scripts/create_postgrest_dev_conf.sh
	docker compose up --detach server
	$(ROOT_DIR)/server/scripts/generate_client.sh
	docker compose down
	cd $(ROOT_DIR)/client && yarn install
	cd $(ROOT_DIR)/server && yarn install

start:
	docker compose up

deploy-server:
	fly deploy

psql:
	docker run --rm -it --network=host postgres:15.2 psql --host 0.0.0.0 --port 5432 --user postgres -d odys_dev	

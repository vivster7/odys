# Define variables
APP_NAME := odys
ROOT_DIR := $(shell git rev-parse --show-toplevel)


# Define targets
.PHONY: setup

setup:
	docker compose up --detach db
	docker compose exec db /src/postgrest/scripts/teardown.sh
	docker compose exec db /src/postgrest/scripts/configure_postgrest.sh
	$(ROOT_DIR)/postgrest/scripts/create_postgrest_dev_conf.sh
	docker compose up --detach postgrest
	$(ROOT_DIR)/postgrest/scripts/generate_client.sh

# all: clean install lint test build

# clean:
# 	@rm -rf $(BUILD_DIR)

# install:
# 	@npm install

# lint:
# 	@$(NODE_MODULES_BIN)/eslint $(SRC_DIR)

# test:
# 	@$(NODE_MODULES_BIN)/mocha $(SRC_DIR)/**/*.spec.js

# build:
# 	@$(NODE_MODULES_BIN)/babel $(SRC_DIR) --out-dir $(BUILD_DIR)

# start:
# 	@node $(BUILD_DIR)/$(APP_NAME).js
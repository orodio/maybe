all: help

help: ## This List
	@echo "Available Make Commands"
	@echo "======================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m make %-15s\033[0m %s\n", $$1, $$2}'

build: ## transpile /src -> /lib
	yarn build

build-watch: ## watch /src then transpile /src -> /lib
	yarn build -- -w

test: ## runs the tests
	yarn test

test-watch: ## watch /src then runs the tests
	yarn test -- --watch

version: ## bump version patch tag
	npm version patch

version-minor: ## bump version minor tag
	npm version minor

version-major: ## bump version major tag
	npm version major

clean: ## Clean build directory
	rm -rf ./lib
	mkdir ./lib

publish: build clean test ## publish to npm
	npm publish

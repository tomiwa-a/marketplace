include .envrc

## help: print this help message
.PHONY: help
help:
	@echo 'Usage:'
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' | sed -e 's/^/ /'

.PHONY: confirm
confirm:
	@echo -n 'Are you sure? [y/N] ' && read ans && [ $${ans:-N} = y ]

## run/api: run the cmd/api application
.PHONY: run/api
run/api:
	@echo ${USER_DB_DSN}
	@go run ./cmd  -db-dsn=${USER_DB_DSN}

## air: run the cmd/api application with AIR package for hot reload
.PHONY: air
air:
	@air


## db/psql: connect to the database using psql
.PHONY: db/psql
db/psql:
	psql ${USER_DB_DSN}

## db/migrations/new name=$1: create a new database migration
.PHONY: db/migrations/new
db/migrations/new:
	@echo 'Creating migration files for ${name}...'
	migrate create -seq -ext=.sql -dir=./migrations ${name}

## db/migrations/up: apply all up database migrations
.PHONY: db/migrations/up
db/migrations/up: 
	@echo 'Running up migrations...'
	migrate -path ./migrations -database ${USER_DB_DSN} up

## db/migrations/down: apply down up database migrations
.PHONY: db/migrations/down
db/migrations/down: confirm
	@echo 'Running down migrations...'
	migrate -path ./migrations -database ${USER_DB_DSN} down ${id}

## db/migrations/version: get migration version
.PHONY: db/migrations/version
db/migrations/version: 
	@migrate -path ./migrations -database ${USER_DB_DSN} version

## db/migrations/force id=$1: force migration to version
.PHONY: db/migrations/force
db/migrations/force: 
	@migrate -path ./migrations -database ${USER_DB_DSN} force ${id}
	

# ==================================================================================== #
# QUALITY CONTROL
# ==================================================================================== #
## audit: tidy dependencies and format, vet and test all code
.PHONY: audit
audit:
	@echo 'Tidying and verifying module dependencies...'
	go mod tidy
	go mod verify
	@echo 'Formatting code...'
	go fmt ./...
	@echo 'Vetting code...'
	go vet ./...
	staticcheck ./...
	@echo 'Running tests...'
	go test -race -vet=off ./...
.PHONY: all check build

INTERNAL_SRC := $(wildcard internal/*.go)

all: build

check:
	@go fmt ./...
	@go vet ./...

lint:
	golangci-lint run --enable-all


build: bin/api_server bin/cess_cli

bin/api_server: $(INTERNAL_SRC) ./cmd/api_server/main.go
	@go build -o bin/api_server ./cmd/api_server

bin/cess_cli: $(INTERNAL_SRC) ./cmd/cess_cli/main.go
	@go build -o bin/cess_cli ./cmd/cess_cli


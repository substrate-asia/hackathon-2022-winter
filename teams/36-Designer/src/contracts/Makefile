.PHONY: all build clean fmt fmt-check init linter pre-commit test

all: init build test

build:
	@echo ──────────── Build release ────────────────────
	@rm -rf ./target/wasm32-unknown-unknown/release/*.wasm
	@cargo +nightly build --release
	@ls -l ./target/wasm32-unknown-unknown/release/*.wasm
	@rm -rf ./release
	@mkdir -p ./release
	@cp ./target/wasm32-unknown-unknown/release/*.wasm ./release/

clean:
	@echo ──────────── Clean ────────────────────────────
	@rm -rvf target

fmt:
	@echo ──────────── Format ───────────────────────────
	@cargo fmt --all

fmt-check:
	@echo ──────────── Check format ─────────────────────
	@cargo fmt --all -- --check

init:
	@echo ──────────── Install toolchains ───────────────
	@rustup toolchain add nightly
	@rustup target add wasm32-unknown-unknown --toolchain nightly

linter:
	@echo ──────────── Run linter ───────────────────────
	@cargo +nightly clippy --all-targets -- --no-deps -D warnings

pre-commit: fmt linter test build

test:
	@echo ──────────── Run tests ────────────────────────
	@cargo +nightly t

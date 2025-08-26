.PHONY: build clean
.DEFAULT_GOAL := all

CC = emcc
CFLAGS = -O3 -Wall -Wextra -DEMSCRIPTEN
WASM_FLAGS = -s WASM=1 \
             -s EXPORTED_RUNTIME_METHODS='["getValue","setValue","HEAP8","HEAPU8"]' \
             -s ALLOW_MEMORY_GROWTH=1 \
			 -s MALLOC=emmalloc \
			 -sSTACK_SIZE=262144 \
             -s MODULARIZE=1 \
			 -s EXPORT_ES6=1 \
             -s EXPORT_NAME="'MLDSA65Module'" \
             -s ENVIRONMENT='web,webview,worker' \
             -s EXPORTED_FUNCTIONS='["_mldsa65_keypair","_mldsa65_sign","_mldsa65_verify", "_malloc", "_free"]' \
             --no-entry \
			 -s SINGLE_FILE \
			 -s EXIT_RUNTIME=0 \
			 -s INCOMING_MODULE_JS_API=[] \
			 --emit-tsd wasm-module.d.ts

PQC_SOURCE=$(wildcard \
	pqclean/common/*.c \
	pqclean/common/**/*.c \
	pqclean/crypto_sign/ml-dsa-65/*.c \
)

# Wrapper source code
APP_SOURCE=$(wildcard *.c)

ALL_SOURCE=$(PQC_SOURCE) $(APP_SOURCE)

BUILD_DIR=build
BIN=wasm-module.js

CFLAGS := \
	-Wall \
	-Wextra \
	-Werror \
	-Wshadow \
	-Werror \
	-Wpointer-arith \
	-Wredundant-decls \
	-Wno-long-long \
	-Wno-unknown-pragmas \
	-Wno-unused-command-line-argument \
	-fomit-frame-pointer \
	-std=c99 \
	-pedantic \
	-MMD \
	-O3 \
	-Ipqclean/common \
    -Ipqclean/crypto_sign/ml-dsa-65 \
	$(CFLAGS)

BINARIES_FULL=$(BUILD_DIR)/$(BIN)

$(BINARIES_FULL): $(ALL_SOURCE)
	echo "$@"
	mkdir -p $(BUILD_DIR)
	$(CC) $(CFLAGS) $(WASM_FLAGS) $^ -o $@

all: build

build: $(BINARIES_FULL)

clean:
	rm -rf $(BUILD_DIR)

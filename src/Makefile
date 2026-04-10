# (SPDX-License-Identifier: CC-BY-4.0)

.PHONY: build clean
.DEFAULT_GOAL := all

CC = emcc
CFLAGS = -O3 -Wall -Wextra -DEMSCRIPTEN
WASM_FLAGS = -s WASM=1 \
             -s EXPORTED_RUNTIME_METHODS='["getValue","setValue","HEAP8","HEAPU8","stackSave","stackAlloc","stackRestore"]' \
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


# When called from the root Makefile, CROSS_PREFIX has already been added here
ifeq (,$(findstring $(CROSS_PREFIX),$(CC)))
CC  := $(CROSS_PREFIX)$(CC)
endif

# mldsa-native source and header files
#
# If you are not concerned about minimizing for a specific backend,
# you can just include all source files into your build.
MLD_SOURCE=$(wildcard				\
	mldsa-native/mldsa/src/*.c			\
	mldsa-native/mldsa/src/**/*.c			\
	mldsa-native/mldsa/src/**/**/*.c		\
	mldsa-native/mldsa/src/**/**/**/*.c)

INC=-Imldsa-native/mldsa

# Wrapper source code
APP_SOURCE=$(wildcard *.c)

ALL_SOURCE=$(MLD_SOURCE) $(APP_SOURCE)

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
	$(CFLAGS)

CFLAGS += -DMLD_CONFIG_NAMESPACE_PREFIX=crypto_sign -DMLD_CONFIG_NO_RANDOMIZED_API -DMLD_CONFIG_NO_SUPERCOP

BINARY_NAME_FULL_768=$(BUILD_DIR)/$(BIN)
BINARIES_FULL=$(BINARY_NAME_FULL_768)

$(BINARY_NAME_FULL_768): CFLAGS += -DMLD_CONFIG_PARAMETER_SET=65

$(BINARIES_FULL): $(ALL_SOURCE)
	echo "$@"
	mkdir -p $(BUILD_DIR)
	$(CC) $(CFLAGS) $(WASM_FLAGS) $(INC) $^ -o $@

all: build

build: $(BINARIES_FULL)

clean:
	rm -rf $(BUILD_DIR)

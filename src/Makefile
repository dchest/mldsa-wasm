# (SPDX-License-Identifier: CC-BY-4.0)

.PHONY: build clean mldsa44_objs mldsa65_objs mldsa87_objs mldsa_objs
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
             -s EXPORT_NAME="'MLDSAModule'" \
             -s ENVIRONMENT='web,webview,worker,node' \
			 -s EXPORTED_FUNCTIONS='["_mldsa44_keypair","_mldsa44_sign","_mldsa44_verify","_mldsa65_keypair","_mldsa65_sign","_mldsa65_verify","_mldsa87_keypair","_mldsa87_sign","_mldsa87_verify", "_malloc", "_free"]' \
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
# For WebAssembly/browser targets, build only the portable C backend.
# This excludes architecture-specific native sources (e.g. AVX2/aarch64).
MLD_SOURCE_ALL=$(wildcard				\
	mldsa-native/mldsa/src/*.c			\
	mldsa-native/mldsa/src/**/*.c			\
	mldsa-native/mldsa/src/**/**/*.c		\
	mldsa-native/mldsa/src/**/**/**/*.c)
MLD_SOURCE=$(foreach S,$(MLD_SOURCE_ALL),\
  $(if $(findstring /native/,$S),,$S))

INC=-Imldsa-native/mldsa

# Wrapper source code
APP_SOURCE=wasm_wrapper.c

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

CFLAGS += -DMLD_CONFIG_NAMESPACE_PREFIX=crypto_sign -DMLD_CONFIG_NO_RANDOMIZED_API -DMLD_CONFIG_NO_SUPERCOP -DMLD_CONFIG_MULTILEVEL_BUILD

BUILD_44_DIR=$(BUILD_DIR)/mldsa44
BUILD_65_DIR=$(BUILD_DIR)/mldsa65
BUILD_87_DIR=$(BUILD_DIR)/mldsa87

MLDSA44_OBJS=$(patsubst %,$(BUILD_44_DIR)/%.o,$(MLD_SOURCE))
MLDSA65_OBJS=$(patsubst %,$(BUILD_65_DIR)/%.o,$(MLD_SOURCE))
MLDSA87_OBJS=$(patsubst %,$(BUILD_87_DIR)/%.o,$(MLD_SOURCE))
MLDSA_OBJS=$(MLDSA44_OBJS) $(MLDSA65_OBJS) $(MLDSA87_OBJS)

WRAPPER_OBJ=$(BUILD_DIR)/$(APP_SOURCE).o

CFLAGS_44 = -DMLD_CONFIG_PARAMETER_SET=44 -DMLD_CONFIG_MULTILEVEL_WITH_SHARED
CFLAGS_65 = -DMLD_CONFIG_PARAMETER_SET=65 -DMLD_CONFIG_MULTILEVEL_NO_SHARED
CFLAGS_87 = -DMLD_CONFIG_PARAMETER_SET=87 -DMLD_CONFIG_MULTILEVEL_NO_SHARED

$(MLDSA44_OBJS): $(BUILD_44_DIR)/%.o: %
	mkdir -p $(@D)
	$(CC) $(CFLAGS) $(CFLAGS_44) $(INC) -c $< -o $@

$(MLDSA65_OBJS): $(BUILD_65_DIR)/%.o: %
	mkdir -p $(@D)
	$(CC) $(CFLAGS) $(CFLAGS_65) $(INC) -c $< -o $@

$(MLDSA87_OBJS): $(BUILD_87_DIR)/%.o: %
	mkdir -p $(@D)
	$(CC) $(CFLAGS) $(CFLAGS_87) $(INC) -c $< -o $@

$(WRAPPER_OBJ): $(APP_SOURCE)
	mkdir -p $(@D)
	$(CC) $(CFLAGS) $(INC) -c $< -o $@

mldsa44_objs: $(MLDSA44_OBJS)
mldsa65_objs: $(MLDSA65_OBJS)
mldsa87_objs: $(MLDSA87_OBJS)
mldsa_objs: mldsa44_objs mldsa65_objs mldsa87_objs

BINARY_NAME_FULL=$(BUILD_DIR)/$(BIN)

$(BINARY_NAME_FULL): $(WRAPPER_OBJ) $(MLDSA_OBJS)
	echo "$@"
	mkdir -p $(BUILD_DIR)
	$(CC) $(WASM_FLAGS) $^ -o $@

all: build

build: $(BINARY_NAME_FULL)

clean:
	rm -rf $(BUILD_DIR)

#ifndef PQCLEAN_MLDSA65_CLEAN_API_H
#define PQCLEAN_MLDSA65_CLEAN_API_H

#include <stddef.h>
#include <stdint.h>

#define PQCLEAN_MLDSA65_CLEAN_CRYPTO_PUBLICKEYBYTES 1952
#define PQCLEAN_MLDSA65_CLEAN_CRYPTO_SECRETKEYBYTES 4032
#define PQCLEAN_MLDSA65_CLEAN_CRYPTO_BYTES 3309
#define PQCLEAN_MLDSA65_CLEAN_CRYPTO_ALGNAME "ML-DSA-65"

// Added for mldsa-wasm:
#define PQCLEAN_MLDSA65_CLEAN_CRYPTO_SEEDBYTES 32
#define PQCLEAN_MLDSA65_CLEAN_CRYPTO_RNDBYTES 32

int PQCLEAN_MLDSA65_CLEAN_crypto_sign_keypair_seed(uint8_t *pk, uint8_t *sk, const uint8_t *seed);

int PQCLEAN_MLDSA65_CLEAN_crypto_sign_signature_ctx_seed(uint8_t *sig, size_t *siglen,
        const uint8_t *m, size_t mlen,
        const uint8_t *ctx, size_t ctxlen,
        const uint8_t *sk,
        const uint8_t *randomness);

int PQCLEAN_MLDSA65_CLEAN_crypto_sign_verify_ctx(const uint8_t *sig, size_t siglen,
        const uint8_t *m, size_t mlen,
        const uint8_t *ctx, size_t ctxlen,
        const uint8_t *pk);

#endif

#include <emscripten.h>
#include <stdint.h>
#include <stdlib.h>

#include "pqclean/crypto_sign/ml-dsa-65/api.h"


EMSCRIPTEN_KEEPALIVE
int mldsa65_keypair(uint8_t *pk, uint8_t *sk, const uint8_t *seed) {
    return PQCLEAN_MLDSA65_CLEAN_crypto_sign_keypair_seed(pk, sk, seed);
}

EMSCRIPTEN_KEEPALIVE
int mldsa65_sign(
    uint8_t *sig, size_t *siglen,
    const uint8_t *m, size_t mlen,
    const uint8_t *ctx, size_t ctxlen,
    const uint8_t *sk,
    const uint8_t *randomness
) {
    return PQCLEAN_MLDSA65_CLEAN_crypto_sign_signature_ctx_seed(
        sig, siglen,
        m, mlen,
        ctx, ctxlen,
        sk,
        randomness
    );
}

EMSCRIPTEN_KEEPALIVE
int mldsa65_verify(
        const uint8_t *sig, size_t siglen,
        const uint8_t *m, size_t mlen,
        const uint8_t *ctx, size_t ctxlen,
        const uint8_t *pk
) {
    return PQCLEAN_MLDSA65_CLEAN_crypto_sign_verify_ctx(
        sig,  siglen,
        m, mlen,
        ctx, ctxlen,
        pk
    );
}

#include <emscripten.h>
#include <stdint.h>
#include <stdlib.h>

#include "mldsa-native/mldsa/mldsa_native.h"


EMSCRIPTEN_KEEPALIVE
int mldsa65_keypair(uint8_t *pk, uint8_t *sk, const uint8_t *seed) {
    return crypto_sign_keypair_internal(pk, sk, seed);
}

EMSCRIPTEN_KEEPALIVE
int mldsa65_sign(
    uint8_t *sig, size_t *siglen,
    const uint8_t *m, size_t mlen,
    const uint8_t *ctx, size_t ctxlen,
    const uint8_t *sk,
    const uint8_t *randomness
) {
    uint8_t pre[MLD_DOMAIN_SEPARATION_MAX_BYTES];
    size_t pre_len;

    pre_len = crypto_sign_prepare_domain_separation_prefix(pre, NULL, 0, ctx, ctxlen,
                                                 MLD_PREHASH_NONE);
    if (pre_len == 0) {
        return MLD_ERR_FAIL;
    }

    return crypto_sign_signature_internal(
        sig, siglen,
        m, mlen,
        pre, pre_len,
        randomness,
        sk,
        0
    );
}

EMSCRIPTEN_KEEPALIVE
int mldsa65_verify(
        const uint8_t *sig, size_t siglen,
        const uint8_t *m, size_t mlen,
        const uint8_t *ctx, size_t ctxlen,
        const uint8_t *pk
) {
    return crypto_sign_verify(
        sig,  siglen,
        m, mlen,
        ctx, ctxlen,
        pk
    );
}

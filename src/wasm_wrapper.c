#include <emscripten.h>
#include <stdint.h>
#include <stdlib.h>

#define MLD_CONFIG_PARAMETER_SET 44
#include "mldsa-native/mldsa/mldsa_native.h"
#undef MLD_CONFIG_PARAMETER_SET
#undef MLD_H

#define MLD_CONFIG_PARAMETER_SET 65
#include "mldsa-native/mldsa/mldsa_native.h"
#undef MLD_CONFIG_PARAMETER_SET
#undef MLD_H

#define MLD_CONFIG_PARAMETER_SET 87
#include "mldsa-native/mldsa/mldsa_native.h"
#undef MLD_CONFIG_PARAMETER_SET
#undef MLD_H


EMSCRIPTEN_KEEPALIVE
int mldsa44_keypair(uint8_t *pk, uint8_t *sk, const uint8_t *seed) {
    return crypto_sign44_keypair_internal(pk, sk, seed);
}

EMSCRIPTEN_KEEPALIVE
int mldsa44_sign(
    uint8_t *sig, size_t *siglen,
    const uint8_t *m, size_t mlen,
    const uint8_t *ctx, size_t ctxlen,
    const uint8_t *sk,
    const uint8_t *randomness
) {
    uint8_t pre[MLD_DOMAIN_SEPARATION_MAX_BYTES];
    size_t pre_len;

    pre_len = crypto_sign44_prepare_domain_separation_prefix(pre, NULL, 0, ctx, ctxlen,
                                                 MLD_PREHASH_NONE);
    if (pre_len == 0) {
        return MLD_ERR_FAIL;
    }

    return crypto_sign44_signature_internal(
        sig, siglen,
        m, mlen,
        pre, pre_len,
        randomness,
        sk,
        0
    );
}

EMSCRIPTEN_KEEPALIVE
int mldsa44_verify(
        const uint8_t *sig, size_t siglen,
        const uint8_t *m, size_t mlen,
        const uint8_t *ctx, size_t ctxlen,
        const uint8_t *pk
) {
    return crypto_sign44_verify(
        sig,  siglen,
        m, mlen,
        ctx, ctxlen,
        pk
    );
}


EMSCRIPTEN_KEEPALIVE
int mldsa65_keypair(uint8_t *pk, uint8_t *sk, const uint8_t *seed) {
    return crypto_sign65_keypair_internal(pk, sk, seed);
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

    pre_len = crypto_sign65_prepare_domain_separation_prefix(pre, NULL, 0, ctx, ctxlen,
                                                 MLD_PREHASH_NONE);
    if (pre_len == 0) {
        return MLD_ERR_FAIL;
    }

    return crypto_sign65_signature_internal(
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
    return crypto_sign65_verify(
        sig,  siglen,
        m, mlen,
        ctx, ctxlen,
        pk
    );
}


EMSCRIPTEN_KEEPALIVE
int mldsa87_keypair(uint8_t *pk, uint8_t *sk, const uint8_t *seed) {
    return crypto_sign87_keypair_internal(pk, sk, seed);
}

EMSCRIPTEN_KEEPALIVE
int mldsa87_sign(
    uint8_t *sig, size_t *siglen,
    const uint8_t *m, size_t mlen,
    const uint8_t *ctx, size_t ctxlen,
    const uint8_t *sk,
    const uint8_t *randomness
) {
    uint8_t pre[MLD_DOMAIN_SEPARATION_MAX_BYTES];
    size_t pre_len;

    pre_len = crypto_sign87_prepare_domain_separation_prefix(pre, NULL, 0, ctx, ctxlen,
                                                 MLD_PREHASH_NONE);
    if (pre_len == 0) {
        return MLD_ERR_FAIL;
    }

    return crypto_sign87_signature_internal(
        sig, siglen,
        m, mlen,
        pre, pre_len,
        randomness,
        sk,
        0
    );
}

EMSCRIPTEN_KEEPALIVE
int mldsa87_verify(
        const uint8_t *sig, size_t siglen,
        const uint8_t *m, size_t mlen,
        const uint8_t *ctx, size_t ctxlen,
        const uint8_t *pk
) {
    return crypto_sign87_verify(
        sig,  siglen,
        m, mlen,
        ctx, ctxlen,
        pk
    );
}

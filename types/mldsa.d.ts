export type MlDsaAlgorithmName = "ML-DSA-44" | "ML-DSA-65" | "ML-DSA-87";
export type MlDsaAlgorithm = {
    name: MlDsaAlgorithmName;
    context?: BufferSource;
} | MlDsaAlgorithmName;
export type MlDsaKeyFormat = "raw-public" | "raw-seed" | "jwk" | "spki" | "pkcs8";
export type ContextParams = {
    context: BufferSource;
};
declare function _isSupportedCryptoKey(key: CryptoKey): boolean;
declare function generateKey(keyAlgorithm: MlDsaAlgorithm, extractable: boolean, usages: KeyUsage[]): Promise<CryptoKeyPair>;
declare function exportKey(format: "jwk", // JWK format returns a JsonWebKey
key: CryptoKey): Promise<JsonWebKey>;
declare function exportKey(format: Exclude<MlDsaKeyFormat, "jwk">, // other formats return an ArrayBuffer
key: CryptoKey): Promise<ArrayBuffer>;
declare function importKey(format: "jwk", keyData: JsonWebKey, algorithm: MlDsaAlgorithm, extractable: boolean, usages: KeyUsage[]): Promise<CryptoKey>;
declare function importKey(format: Exclude<MlDsaKeyFormat, "jwk">, keyData: BufferSource, algorithm: MlDsaAlgorithm, extractable: boolean, usages: KeyUsage[]): Promise<CryptoKey>;
declare function getPublicKey(key: CryptoKey, usages: KeyUsage[]): Promise<CryptoKey>;
declare function verify(algorithm: MlDsaAlgorithm, key: CryptoKey, signature: BufferSource, message: BufferSource): Promise<boolean>;
declare function sign(algorithm: MlDsaAlgorithm, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer>;
declare const mldsa: {
    generateKey: typeof generateKey;
    exportKey: typeof exportKey;
    importKey: typeof importKey;
    getPublicKey: typeof getPublicKey;
    sign: typeof sign;
    verify: typeof verify;
    _isSupportedCryptoKey: typeof _isSupportedCryptoKey;
};
export default mldsa;

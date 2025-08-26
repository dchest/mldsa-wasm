/**
 * ML-DSA-65, a post-quantum signature algorithm in WebAssembly,
 * based on PQClean <https://github.com/PQClean/PQClean>.
 *
 * Provides an API compatible with the WebCrypto API proposed in
 * "Modern Algorithms in the Web Cryptography API,"
 * Draft Community Group Report, 11 August 2025:
 * <https://wicg.github.io/webcrypto-modern-algos/>.
 *
 * PQClean is in public domain / CC0 license:
 * https://github.com/PQClean/PQClean/blob/master/crypto_sign/ml-dsa-65/clean/LICENSE
 *
 * WASM wrapper license: MIT License
 * Copyright (c) 2025 Dmitry Chestnykh
 */
import MLDSA65Module from "./build/wasm-module.js";

const ALGORITHM_NAME = "ML-DSA-65";
const JWK_ALG = "ML-DSA-65";

export type MlDsaAlgorithm =
  | { name: "ML-DSA-65"; context?: BufferSource }
  | "ML-DSA-65";

type MlDsaNormalizedAlgorithm = { name: "ML-DSA-65"; context?: BufferSource };

const KEY_USAGES = ["sign", "verify"];

export type MlDsaKeyFormat =
  | "raw-public"
  | "raw-seed"
  | "jwk"
  | "spki"
  | "pkcs8";

export type ContextParams = {
  context: BufferSource;
};

class MlDsaOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OperationError";
  }
}

class MlDsaInvalidAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAccessError";
  }
}

class MlDsaNotSupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotSupportedError";
  }
}

class MlDsaDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataError";
  }
}

// Internal key data storage holds key material
// for each mldsa-wasm CryptoKey in a WeakMap,
// preventing its exposure outside the module.

type InternalKeyData = {
  publicKeyData: Uint8Array<ArrayBuffer>;
  privateSeedData?: Uint8Array<ArrayBuffer>;
  privateSecretKeyData?: Uint8Array<ArrayBuffer>;
};

const internalKeyData = new WeakMap<CryptoKey, InternalKeyData>();

function getInternalKeyData(key: CryptoKey): InternalKeyData {
  const keyData = internalKeyData.get(key);
  if (!keyData) {
    throw new TypeError("Unknown key object");
  }
  return keyData;
}

// Keys are added to the finalization registry to attempt
// wiping key material from memory when the key is garbage collected.
const cleanupRegistry = new FinalizationRegistry((keyData: InternalKeyData) => {
  keyData.publicKeyData.fill(0);
  keyData.privateSeedData?.fill(0);
  keyData.privateSecretKeyData?.fill(0);
});

function getPublicKeyDataRef(key: CryptoKey): Uint8Array<ArrayBuffer> {
  const keyData = getInternalKeyData(key);
  if (!keyData.publicKeyData) {
    throw new MlDsaOperationError("Failed to get public key data");
  }
  return keyData.publicKeyData;
}

function getPrivateKeyDataRef(key: CryptoKey): {
  publicKeyData: Uint8Array<ArrayBuffer>;
  privateSeedData: Uint8Array<ArrayBuffer>;
  privateSecretKeyData: Uint8Array<ArrayBuffer>;
} {
  const keyData = getInternalKeyData(key);
  if (!keyData.privateSeedData || !keyData.privateSecretKeyData) {
    throw new MlDsaOperationError("Failed to get private key data");
  }
  return keyData as any;
}

const noClone = Symbol("CryptoKey created by mldsa-wasm cannot be cloned");
const keyIdKey = "_mldsa_wasm";
const emptyToJSON = () => ({});

function createKeyObject(
  type: "public" | "private",
  extractable: boolean,
  usages: KeyUsage[],
  keyData: InternalKeyData
): CryptoKey {
  const key = {
    type,
    extractable,
    algorithm: Object.freeze({ name: ALGORITHM_NAME }),
    usages: Object.freeze(Array.from(usages)),
    [keyIdKey]: noClone, // to prevent structured cloning
  } as unknown as CryptoKey;
  // toJSON in CryptoKey returns {}
  Object.defineProperty(key, "toJSON", {
    value: emptyToJSON,
    writable: false,
    enumerable: false,
    configurable: false,
  });
  Object.setPrototypeOf(key, CryptoKey.prototype);
  internalKeyData.set(key, keyData);
  cleanupRegistry.register(key, keyData);
  return Object.freeze(key);
}

function createPublicKey(
  publicKeyData: Uint8Array<ArrayBuffer>,
  usages: KeyUsage[]
): CryptoKey {
  return createKeyObject("public", true, usages, { publicKeyData });
}

function createPrivateKey(
  publicKeyData: Uint8Array<ArrayBuffer>,
  privateSeedData: Uint8Array<ArrayBuffer>,
  privateSecretKeyData: Uint8Array<ArrayBuffer>,
  extractable: boolean,
  usages: KeyUsage[]
): CryptoKey {
  return createKeyObject("private", extractable, usages, {
    publicKeyData,
    privateSeedData,
    privateSecretKeyData,
  });
}

function _isSupportedCryptoKey(key: CryptoKey): boolean {
  return (
    key instanceof CryptoKey &&
    keyIdKey in key &&
    key[keyIdKey] == noClone &&
    internalKeyData.has(key)
  );
}

function toBase64url(data: Uint8Array<ArrayBuffer>): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "===".slice((base64.length + 3) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

const PUBLICKEY_BYTES = 1952;
const SECRETKEY_BYTES = 4032;
const SIGNATURE_BYTES = 3309;
const KEYPAIR_SEED_BYTES = 32;
const SIGN_RANDOM_BYTES = 32;

let _module: any | undefined;

async function getModule() {
  if (!_module) {
    _module = await MLDSA65Module();
  }
  return _module;
}

const getRandomValues = crypto.getRandomValues.bind(crypto);

function normalizeAlgorithm(algorithm: unknown): MlDsaNormalizedAlgorithm {
  const name =
    typeof algorithm === "string"
      ? algorithm.toUpperCase()
      : typeof algorithm === "object" &&
        algorithm !== null &&
        "name" in algorithm &&
        typeof algorithm.name === "string"
      ? algorithm.name.toUpperCase()
      : null;
  if (name !== ALGORITHM_NAME) {
    throw new TypeError("Unsupported algorithm");
  }
  const context =
    typeof algorithm === "object" &&
    algorithm !== null &&
    "context" in algorithm
      ? (algorithm.context as BufferSource)
      : undefined;
  return { name: ALGORITHM_NAME, context };
}

async function internalGenerateKeyPair(coins: Uint8Array<ArrayBuffer>) {
  const module = await getModule();
  let pkPtr = 0,
    skPtr = 0,
    coinsPtr = 0;
  try {
    pkPtr = module._malloc(PUBLICKEY_BYTES);
    skPtr = module._malloc(SECRETKEY_BYTES);
    coinsPtr = module._malloc(KEYPAIR_SEED_BYTES);
    if (pkPtr === 0 || skPtr === 0 || coinsPtr === 0) {
      throw new MlDsaOperationError("Memory allocation failed");
    }

    module.HEAPU8.set(coins, coinsPtr);

    const result = module._mldsa65_keypair(pkPtr, skPtr, coinsPtr);
    if (result !== 0) {
      throw new MlDsaOperationError("Key generation failed");
    }

    const rawPublicKey = new Uint8Array(PUBLICKEY_BYTES);
    const rawSecretKey = new Uint8Array(SECRETKEY_BYTES);
    const rawSeed = new Uint8Array(coins);

    rawPublicKey.set(module.HEAPU8.subarray(pkPtr, pkPtr + PUBLICKEY_BYTES));
    rawSecretKey.set(module.HEAPU8.subarray(skPtr, skPtr + SECRETKEY_BYTES));

    module.HEAPU8.fill(0, pkPtr, pkPtr + PUBLICKEY_BYTES);
    module.HEAPU8.fill(0, skPtr, skPtr + SECRETKEY_BYTES);
    module.HEAPU8.fill(0, coinsPtr, coinsPtr + KEYPAIR_SEED_BYTES);

    return { rawPublicKey, rawSecretKey, rawSeed };
  } finally {
    if (pkPtr !== 0) module._free(pkPtr);
    if (skPtr !== 0) module._free(skPtr);
    if (coinsPtr !== 0) module._free(coinsPtr);
  }
}

async function generateKey(
  keyAlgorithm: MlDsaAlgorithm,
  extractable: boolean,
  usages: KeyUsage[]
): Promise<CryptoKeyPair> {
  normalizeAlgorithm(keyAlgorithm);

  // 1. If usages contains a value which is not one of "sign" or "verify", then throw a SyntaxError.
  if (
    !Array.isArray(usages) ||
    usages.some((usage) => !KEY_USAGES.includes(usage))
  ) {
    throw new SyntaxError("Invalid key usages");
  }

  // 2. Generate an ML-DSA key pair, as described in Section 5.1 of [FIPS-204],
  // with the parameter set indicated by the name member of normalizedAlgorithm.
  // 3. If the key generation step fails, then throw an OperationError.
  // (Handled by the internalGenerateKeyPair method)
  const { rawPublicKey, rawSecretKey, rawSeed } = await internalGenerateKeyPair(
    getRandomValues(new Uint8Array(KEYPAIR_SEED_BYTES))
  );

  const publicKey = createPublicKey(rawPublicKey, ["verify"]);

  const privateKey = createPrivateKey(
    rawPublicKey,
    rawSeed,
    rawSecretKey,
    extractable,
    ["sign"]
  );

  return {
    publicKey,
    privateKey,
  };
}

type DEREncoding = { fullLength: number; prefix: Uint8Array };

const MLDSA65_SPKI: DEREncoding = {
  fullLength: 1974,
  prefix: new Uint8Array([
    0x30, 0x82, 0x07, 0xb2, 0x30, 0x0b, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01,
    0x65, 0x03, 0x04, 0x03, 0x12, 0x03, 0x82, 0x07, 0xa1, 0x00,
  ]),
};

const MLDSA65_PKCS8: DEREncoding = {
  fullLength: 54,
  prefix: new Uint8Array([
    0x30, 0x34, 0x02, 0x01, 0x00, 0x30, 0x0b, 0x06, 0x09, 0x60, 0x86, 0x48,
    0x01, 0x65, 0x03, 0x04, 0x03, 0x12, 0x04, 0x22, 0x80, 0x20,
  ]),
};

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

function derToRaw(
  encoding: DEREncoding,
  der: Uint8Array
): Uint8Array<ArrayBuffer> {
  if (der.length !== encoding.fullLength) {
    throw new MlDsaDataError("Invalid encoding");
  }
  const prefix = der.subarray(0, encoding.prefix.length);
  if (!bytesEqual(prefix, encoding.prefix)) {
    // XXX: could also be DataError, but we can't distinguish it with simple parser.
    throw new MlDsaNotSupportedError("Unsupported encoding");
  }
  return der.slice(encoding.prefix.length);
}

function rawToDer(
  encoding: DEREncoding,
  raw: Uint8Array
): Uint8Array<ArrayBuffer> {
  const der = new Uint8Array(encoding.fullLength);
  der.set(encoding.prefix);
  der.set(raw, encoding.prefix.length);
  return der;
}

async function exportKey(
  format: "jwk", // JWK format returns a JsonWebKey
  key: CryptoKey
): Promise<JsonWebKey>;
async function exportKey(
  format: Exclude<MlDsaKeyFormat, "jwk">, // other formats return an ArrayBuffer
  key: CryptoKey
): Promise<ArrayBuffer>;
async function exportKey(
  format: MlDsaKeyFormat,
  key: CryptoKey
): Promise<ArrayBuffer | JsonWebKey> {
  if (!(key instanceof CryptoKey)) {
    throw new TypeError("Expected key to be an instance of CryptoKey");
  }
  normalizeAlgorithm(key.algorithm);
  // 1. If the underlying cryptographic key material represented by the
  // [[handle]] internal slot of key cannot be accessed, then throw an
  // OperationError.
  if (!key.extractable) {
    throw new MlDsaOperationError("Key is not extractable");
  }

  // 2. If format is "spki":
  if (format === "spki") {
    // If the [[type]] internal slot of key is not "public", then throw
    // an InvalidAccessError.
    if (key.type !== "public") {
      throw new TypeError("Expected key type to be 'public'");
    }
    // Let data be an instance of the SubjectPublicKeyInfo ASN.1 structure
    // defined in [RFC5280] with the following properties:
    // Let result be the result of DER-encoding data.
    // Let result be data.
    return rawToDer(MLDSA65_SPKI, getPublicKeyDataRef(key)).buffer; // copy
  }

  // 2. If format is "pkcs8":
  if (format === "pkcs8") {
    // If the [[type]] internal slot of key is not "private", then throw
    // an InvalidAccessError.
    if (key.type !== "private") {
      throw new MlDsaInvalidAccessError("Expected key type to be 'private'");
    }
    // Let data be an instance of the PrivateKeyInfo ASN.1 structure
    // defined in [RFC5208] with the following properties: ...
    // Set the privateKey field to the result of DER-encoding a ML-DSA-65-PrivateKey
    // ASN.1 type that represents the ML-DSA private key seed represented by the
    // [[handle]] internal slot of key using the seed-only format (using a
    // context-specific [0] primitive tag with an implicit encoding of OCTET STRING).
    // Let result be the result of DER-encoding data.
    return rawToDer(MLDSA65_PKCS8, getPrivateKeyDataRef(key).privateSeedData)
      .buffer; // copy
  }

  // 2. If format is "raw-public":
  if (format === "raw-public") {
    // If the [[type]] internal slot of key is not "public", then throw
    // an InvalidAccessError.
    if (key.type !== "public") {
      throw new TypeError("Expected key type to be 'public'");
    }
    // Let data be a byte sequence containing the ML-DSA public key
    // represented by the [[handle]] internal slot of key.
    // Let result be data.
    return new Uint8Array(getPublicKeyDataRef(key)).buffer; // copy
  }
  // 2. If format is "raw-seed":
  if (format === "raw-seed") {
    // 2.1 If the [[type]] internal slot of key is not "private", then throw
    // an InvalidAccessError.
    if (key.type !== "private") {
      throw new MlDsaInvalidAccessError("Expected key type to be 'private'");
    }
    // Let data be a byte sequence containing the ξ seed variable of the key
    // represented by the [[handle]] internal slot of key.
    // Let result be data.
    return new Uint8Array(getPrivateKeyDataRef(key).privateSeedData).buffer; // copy
  }
  // 2. If format is "jwk":
  if (format === "jwk") {
    // Let jwk be a new JsonWebKey dictionary.
    const jwk = {
      // Set the kty attribute of jwk to "AKP".
      kty: "AKP",
      // Set the alg attribute of jwk to the name member of normalizedAlgorithm.
      alg: JWK_ALG,
      // Set the pub attribute of jwk to the base64url encoded public key
      // corresponding to the [[handle]] internal slot of key.
      pub: toBase64url(getPublicKeyDataRef(key)),
    } as any;
    // If the [[type]] internal slot of key is "private":
    if (key.type === "private") {
      // Set the priv attribute of jwk to the base64url encoded
      // private key corresponding to the [[handle]] internal slot of key.
      jwk.priv = toBase64url(getPrivateKeyDataRef(key).privateSeedData); // "copy"
    }
    // Set the key_ops attribute of jwk to the usages attribute of key.
    jwk.key_ops = key.usages;
    // Set the ext attribute of jwk to the [[extractable]] internal slot of key.
    jwk.ext = key.extractable;

    // Let result be jwk.
    return jwk as JsonWebKey;
  }
  // 2. Otherwise: throw a NotSupportedError.
  throw new MlDsaNotSupportedError("Format not supported");
}

function bufferSourcetoUint8Array(value: unknown): Uint8Array<ArrayBuffer> {
  if (ArrayBuffer.isView(value) && value.buffer instanceof ArrayBuffer) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  } else if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  } else {
    throw new TypeError("Value must be a BufferSource");
  }
}

function bufferSourcetoUint8ArrayCopy(value: unknown): Uint8Array<ArrayBuffer> {
  return bufferSourcetoUint8Array(value).slice();
}

async function importKey(
  format: "jwk",
  keyData: JsonWebKey,
  algorithm: MlDsaAlgorithm,
  extractable: boolean,
  usages: KeyUsage[]
): Promise<CryptoKey>;
async function importKey(
  format: Exclude<MlDsaKeyFormat, "jwk">,
  keyData: BufferSource,
  algorithm: MlDsaAlgorithm,
  extractable: boolean,
  usages: KeyUsage[]
): Promise<CryptoKey>;
async function importKey(
  format: MlDsaKeyFormat,
  keyData: BufferSource | JsonWebKey,
  algorithm: MlDsaAlgorithm,
  extractable: boolean,
  usages: KeyUsage[]
): Promise<CryptoKey> {
  normalizeAlgorithm(algorithm);
  // 1. If format is "spki":
  if (format === "spki") {
    // If usages contains a value which is not "verify" then throw a SyntaxError.
    if (!Array.isArray(usages) || usages.some((usage) => usage !== "verify")) {
      throw new SyntaxError("Invalid key usages for public key");
    }
    // Let spki be the result of running the parse a subjectPublicKeyInfo algorithm over keyData.
    // If an error occurred while parsing, then throw a DataError.
    const data = derToRaw(MLDSA65_SPKI, bufferSourcetoUint8Array(keyData));
    if (data.length !== PUBLICKEY_BYTES) {
      throw new MlDsaDataError("Invalid key length");
    }
    return createPublicKey(data, usages);
  }

  // 1. If format is "pkcs8":
  if (format === "pkcs8") {
    // If usages contains a value which is not "sign" then throw a SyntaxError.
    if (!Array.isArray(usages) || usages.some((usage) => usage !== "sign")) {
      throw new SyntaxError("Invalid key usages for private key");
    }
    // TODO: allow more bytes for keys that have both seed and privateKey.
    const data = derToRaw(MLDSA65_PKCS8, bufferSourcetoUint8Array(keyData));
    if (data.length !== KEYPAIR_SEED_BYTES) {
      throw new MlDsaDataError("Invalid key length");
    }
    const { rawPublicKey, rawSecretKey, rawSeed } =
      await internalGenerateKeyPair(data);
    return createPrivateKey(
      rawPublicKey,
      rawSeed,
      rawSecretKey,
      extractable,
      usages
    );
  }

  // 1. If format is "raw-public":
  if (format === "raw-public") {
    // If usages contains a value which is not "verify" then throw a SyntaxError.
    if (!Array.isArray(usages) || usages.some((usage) => usage !== "verify")) {
      throw new SyntaxError("Invalid key usages for public key");
    }
    const data = bufferSourcetoUint8ArrayCopy(keyData);
    return createPublicKey(data, usages);
  }
  // 1. If format is "raw-seed":
  if (format === "raw-seed") {
    // If usages contains an entry which is not "sign" then throw a SyntaxError.
    if (!Array.isArray(usages) || usages.some((usage) => usage !== "sign")) {
      throw new SyntaxError("Invalid key usages for private key");
    }
    // Let data be keyData.
    const data = bufferSourcetoUint8ArrayCopy(keyData);
    // If the length in bits of data is not 256 then throw a DataError.
    if (data.length !== KEYPAIR_SEED_BYTES) {
      throw new MlDsaDataError("Invalid key length");
    }
    // Let privateKey be the result of performing the ML-DSA.KeyGen_internal
    // function described in Section 6.1 of [FIPS-204] with the parameter set
    // indicated by the name member of normalizedAlgorithm, using data as ξ.
    const { rawPublicKey, rawSecretKey, rawSeed } =
      await internalGenerateKeyPair(data);
    return createPrivateKey(
      rawPublicKey,
      rawSeed,
      rawSecretKey,
      extractable,
      usages
    );
  }
  // 1. If format is "jwk":
  if (format === "jwk") {
    // If keyData is a JsonWebKey dictionary:
    // Let jwk equal keyData.
    // Otherwise: Throw a DataError.
    if (typeof keyData !== "object" || keyData === null) {
      throw new MlDsaDataError(
        "Expected keyData to be a JsonWebKey dictionary"
      );
    }
    const jwk = keyData as any;
    // If the priv field is present and usages contains a value which is not
    // "sign", or, if the priv field is not present and usages contains a value
    // which is not "verify" then throw a SyntaxError.
    if (
      (jwk.priv && usages.some((usage) => usage !== "sign")) ||
      (!jwk.priv && usages.some((usage) => usage !== "verify"))
    ) {
      throw new SyntaxError("Invalid key usages for private key");
    }
    // If the kty field of jwk is not "AKP", then throw a DataError.
    if (jwk.kty !== "AKP") {
      throw new MlDsaDataError("Invalid key type");
    }
    // If the alg field of jwk is not equal to the name member of normalizedAlgorithm,
    // then throw a DataError.
    if (jwk.alg !== JWK_ALG) {
      throw new MlDsaDataError("Invalid algorithm");
    }
    // If usages is non-empty and the use field of jwk is present and is not equal to "sig",
    // then throw a DataError.
    if (usages.length > 0 && jwk.use && jwk.use !== "sig") {
      throw new MlDsaDataError("Invalid key usage");
    }
    // If the key_ops field of jwk is present, and is invalid according
    // to the requirements of JSON Web Key [JWK], or it does not contain all
    // of the specified usages values, then throw a DataError.
    if (
      (jwk.key_ops &&
        Array.isArray(jwk.key_ops) &&
        !Array.prototype.every.call(jwk.key_ops, (op: any) =>
          KEY_USAGES.includes(op)
        )) ||
      !Array.isArray(jwk.key_ops)
    ) {
      throw new MlDsaDataError("Invalid key operations");
    }
    // If the ext field of jwk is present and has the value false and
    // extractable is true, then throw a DataError.
    if (jwk.ext === false && extractable) {
      throw new MlDsaDataError("Invalid key extractability");
    }
    // If the priv field of jwk is present:
    if (jwk.priv) {
      // If the priv attribute of jwk does not contain a valid
      // base64url encoded seed representing an ML-DSA private key, then
      // throw a DataError.
      try {
        const seedData = fromBase64url(jwk.priv);
        if (seedData.length !== KEYPAIR_SEED_BYTES) {
          throw new MlDsaDataError("Invalid private key length");
        }
        // Let key be a new CryptoKey object that represents the ML-DSA
        // private key identified by interpreting the priv attribute of
        // jwk as a base64url encoded seed.
        const { rawPublicKey, rawSecretKey, rawSeed } =
          await internalGenerateKeyPair(seedData);
        // Set the [[type]] internal slot of Key to "private".
        const key = createPrivateKey(
          rawPublicKey,
          rawSeed,
          rawSecretKey,
          extractable,
          usages
        );
        // If the pub attribute of jwk does not contain the base64url
        // encoded public key representing the ML-DSA public key
        // corresponding to key, then throw a DataError.
        if (toBase64url(rawPublicKey) !== jwk.pub) {
          throw new MlDsaDataError("Invalid public key data");
        }
        return key;
      } catch {
        throw new MlDsaDataError("Invalid private key format");
      }
    } else {
      // If the pub attribute of jwk does not contain a valid
      // base64url encoded public key representing an ML-DSA public key, then
      // throw a DataError.
      try {
        const publicKeyData = fromBase64url(jwk.pub);
        if (publicKeyData.length !== PUBLICKEY_BYTES) {
          throw new MlDsaDataError("Invalid public key data");
        }
        // Let key be a new CryptoKey object that represents the
        // ML-DSA public key identified by interpreting the pub attribute of
        // jwk as a base64url encoded public key.
        return createPublicKey(publicKeyData, usages);
      } catch {
        throw new MlDsaDataError("Invalid public key format");
      }
    }
  }
  throw new MlDsaNotSupportedError("Unsupported key format");
}

export function getPublicKey(key: CryptoKey, usages: KeyUsage[]) {
  if (!(key instanceof CryptoKey)) {
    throw new TypeError("Expected key to be an instance of CryptoKey");
  }
  normalizeAlgorithm(key.algorithm);
  if (key.type !== "private") {
    throw new MlDsaInvalidAccessError("Expected key type to be 'private'");
  }
  if (!Array.isArray(usages) || usages.some((usage) => usage !== "verify")) {
    throw new SyntaxError("Invalid key usages");
  }
  const keyData = getInternalKeyData(key);
  if (!keyData.publicKeyData) {
    throw new MlDsaOperationError("Failed to get public key data");
  }
  return createPublicKey(new Uint8Array(keyData.publicKeyData), usages);
}

async function verify(
  algorithm: MlDsaAlgorithm,
  key: CryptoKey,
  signature: BufferSource,
  message: BufferSource
) {
  const module = await getModule();
  const normAlgo = normalizeAlgorithm(algorithm);

  if (!(key instanceof CryptoKey) || key.type !== "public") {
    throw new MlDsaInvalidAccessError(
      "Expected publicKey to be an instance of CryptoKey with type 'public'"
    );
  }
  if (!key.usages.includes("verify")) {
    throw new MlDsaInvalidAccessError(`Key usages don't include 'verify'`);
  }

  const publicKeyData = getPublicKeyDataRef(key);
  if (!publicKeyData || publicKeyData.length !== PUBLICKEY_BYTES) {
    throw new MlDsaOperationError("Invalid public key");
  }

  const sig = bufferSourcetoUint8Array(signature);
  if (sig.length !== SIGNATURE_BYTES) {
    return false;
  }
  const ctx = normAlgo.context
    ? bufferSourcetoUint8Array(normAlgo.context)
    : null;
  const ctxLen = ctx == null ? 0 : ctx.length;
  if (ctxLen > 255) {
    throw new MlDsaDataError("Context is too long");
  }

  const msg = bufferSourcetoUint8Array(message);
  const msgLen = msg.length;

  let msgPtr = 0,
    sigPtr = 0,
    pkPtr = 0,
    ctxPtr = 0;
  try {
    sigPtr = module._malloc(SIGNATURE_BYTES);
    pkPtr = module._malloc(PUBLICKEY_BYTES);
    msgPtr = module._malloc(msgLen);
    ctxPtr = ctxLen > 0 ? module._malloc(ctxLen) : 0;
    if (
      sigPtr === 0 ||
      pkPtr === 0 ||
      msgPtr === 0 ||
      (ctxPtr === 0 && ctxLen > 0)
    ) {
      throw new MlDsaOperationError("Memory allocation failed");
    }

    module.HEAPU8.set(sig, sigPtr);
    module.HEAPU8.set(publicKeyData, pkPtr);
    module.HEAPU8.set(msg, msgPtr);
    if (ctxLen > 0) {
      module.HEAPU8.set(ctx, ctxPtr);
    }

    /*
    int mldsa65_verify(
        const uint8_t *sig, size_t siglen,
        const uint8_t *m, size_t mlen,
        const uint8_t *ctx, size_t ctxlen,
        const uint8_t *pk
    )
    */

    const result = module._mldsa65_verify(
      sigPtr,
      SIGNATURE_BYTES,
      msgPtr,
      msgLen,
      ctxPtr,
      ctxLen,
      pkPtr
    );

    return result === 0;
  } finally {
    if (msgPtr !== 0) module._free(msgPtr);
    if (sigPtr !== 0) module._free(sigPtr);
    if (pkPtr !== 0) module._free(pkPtr);
    if (ctxPtr !== 0) module._free(ctxPtr);
  }
}

async function sign(
  algorithm: MlDsaAlgorithm,
  key: CryptoKey,
  data: BufferSource
) {
  const module = await getModule();
  const normAlgo = normalizeAlgorithm(algorithm);

  if (!(key instanceof CryptoKey) || key.type !== "private") {
    throw new MlDsaInvalidAccessError(
      "Expected key to be an instance of CryptoKey with type 'private'"
    );
  }
  if (!key.usages.includes("sign")) {
    throw new MlDsaInvalidAccessError(`Key usages don't include 'sign'`);
  }

  const secretKeyData = getPrivateKeyDataRef(key).privateSecretKeyData;
  if (!secretKeyData || secretKeyData.length !== SECRETKEY_BYTES) {
    throw new Error("Invalid secret key");
  }

  const context = normAlgo.context ?? new Uint8Array(0);
  const ctx = bufferSourcetoUint8Array(context);
  const ctxLen = ctx.length;
  if (ctxLen > 255) {
    throw new MlDsaDataError("Context too long");
  }

  const msg = bufferSourcetoUint8Array(data);
  const msgLen = msg.length;
  const randomness = getRandomValues(new Uint8Array(SIGN_RANDOM_BYTES));

  let skPtr = 0,
    rndPtr = 0,
    sigPtr = 0,
    ctxPtr = 0,
    msgPtr = 0;
  try {
    skPtr = module._malloc(SECRETKEY_BYTES);
    rndPtr = module._malloc(SIGN_RANDOM_BYTES);
    sigPtr = module._malloc(SIGNATURE_BYTES);
    ctxPtr = module._malloc(ctxLen);
    msgPtr = module._malloc(msgLen);
    if (
      skPtr === 0 ||
      rndPtr === 0 ||
      sigPtr === 0 ||
      ctxPtr === 0 ||
      msgPtr === 0
    ) {
      throw new MlDsaOperationError("Failed to allocate memory");
    }

    module.HEAPU8.set(secretKeyData, skPtr);
    module.HEAPU8.set(randomness, rndPtr);
    module.HEAPU8.set(ctx, ctxPtr);
    module.HEAPU8.set(msg, msgPtr);

    /*
    int mldsa65_sign(
      uint8_t *sig, size_t *siglen,
      const uint8_t *m, size_t mlen,
      const uint8_t *ctx, size_t ctxlen,
      const uint8_t *sk,
      const uint8_t *randomness
    )
    */
    const result = module._mldsa65_sign(
      sigPtr,
      SIGNATURE_BYTES,
      msgPtr,
      msgLen,
      ctxPtr,
      ctxLen,
      skPtr,
      rndPtr
    );
    if (result !== 0) {
      throw new MlDsaOperationError("Signing failed");
    }

    const signature = new Uint8Array(SIGNATURE_BYTES);
    signature.set(module.HEAPU8.subarray(sigPtr, sigPtr + SIGNATURE_BYTES));

    module.HEAPU8.fill(0, skPtr, skPtr + SECRETKEY_BYTES);
    module.HEAPU8.fill(0, rndPtr, rndPtr + SIGN_RANDOM_BYTES);
    randomness.fill(0);

    return signature.buffer;
  } finally {
    if (skPtr !== 0) module._free(skPtr);
    if (rndPtr !== 0) module._free(rndPtr);
    if (sigPtr !== 0) module._free(sigPtr);
    if (ctxPtr !== 0) module._free(ctxPtr);
    if (msgPtr !== 0) module._free(msgPtr);
  }
}

const mldsa = {
  generateKey,
  exportKey,
  importKey,
  getPublicKey,
  sign,
  verify,
  _isSupportedCryptoKey,
};

export default mldsa;

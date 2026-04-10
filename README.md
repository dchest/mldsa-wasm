# mldsa-wasm

**ML-DSA, a post-quantum digital signature algorithm in WebAssembly.**

This package provides a WebAssembly-based implementation of ML-DSA, based on [mldsa-native](https://github.com/pq-code-package/mldsa-native). It exposes a modern, WebCrypto-compatible API for key generation, signing, and verification, all bundled in a single JavaScript file with the WASM module inlined.

## Features

- API compatible with the [WebCrypto API draft for modern algorithms](https://wicg.github.io/webcrypto-modern-algos/) (when it ships, replace `mldsa` with `crypto.subtle` and burn this package).
- All code and WASM are bundled into a single `dist/mldsa.js` ES module (no external `.wasm` files needed).
- Works in browsers and Node.js, and should work everywhere WebAssembly is supported.
- 192 KB unminified .js (43 KB gzipped / 33 KB brotlied).
- Fast: signing at 3300 ops/sec, verifying at 11900 ops/sec on MacBook Air M1 for ML-DSA-65.
- All ML-DSA variants: ML-DSA-44, ML-DSA-65, and ML-DSA-87.

Use it as a stopgap solution until the [WebCrypto API supports ML-DSA natively](https://wicg.github.io/webcrypto-modern-algos/).

Demo: <https://dchest.github.io/mldsa-wasm/>

> [!CAUTION]
> Beta version. CONTAINS CRYPTOGRAPHY! Use at your own risk.

## Limitations

- The `CryptoKey` returned by this module's `generateKey` and `importKey` has the same prototype as WebCrypto's `CryptoKey`, but cannot be cloned with `structuredClone`, so you cannot, for example, save them to IndexedDB, pass them to a worker, or use `wrapKey` on them, without exporting. You can only use them with this library's methods. Cloning is deliberately disabled to prevent compatibility issues with the future WebCrypto API (e.g., you saved an `mldsa-wasm` key to IndexedDB, and then switched to the native WebCrypto API, which has its own internal key format and cannot deserialize it).
- Key material is not accessible from outside of the module (that is, you should not be able to get raw key data without exporting), but is somewhere in JavaScript memory until garbage collected. The module takes care to wipe key data from memory during garbage collection, but JavaScript runtimes may optimize this cleanup away.
- Operations, while asynchronous on the surface (all functions are `async` to be compatible and to be able to load the WASM module without a separate initialization call), are done synchronously, instead of being fully asynchronous like in the WebCrypto API. You may consider it an improvement.
- Base64 encoding and decoding for JWK is not constant-time (not sure if it is in other implementations except BoringSSL, though).
- `pkcs8` import only supports the seed format of private keys (as nature intended).

## Installation

```sh
npm install mldsa-wasm
```

## Usage Example

### Signing and verifying

```js
import mldsa from "mldsa-wasm";

// Generate key pair
const keyPair = await mldsa.generateKey({ name: "ML-DSA-65" }, true, [
  "sign",
  "verify",
]);
const { publicKey, privateKey } = keyPair;

// Sign a message
const message = new TextEncoder().encode("Hello, world!");

const signature = await mldsa.sign({ name: "ML-DSA-65" }, privateKey, message);

// Verify a signature
const isValid = await mldsa.verify(
  { name: "ML-DSA-65" },
  publicKey,
  signature,
  message
);

console.log("Signature is valid:", isValid); // true

// Sign a message with context (maximum 255 bytes)
const context = new TextEncoder().encode("MyApp v1.0");
const signatureWithContext = await mldsa.sign(
  { name: "ML-DSA-65", context },
  privateKey,
  message
);

// Verify a signature with context
const isValidWithContext = await mldsa.verify(
  { name: "ML-DSA-65", context },
  publicKey,
  signatureWithContext,
  message
);
```

### Exporting and importing keys

You can export and import ML-DSA keys in several formats. Here are some examples:

#### Exporting a public key (raw format)

```js
// Export public key as raw bytes
const rawPublicKey = await mldsa.exportKey("raw-public", publicKey);
// rawPublicKey is an ArrayBuffer
```

#### Exporting a private key (seed format)

```js
// Export private key as a seed
const rawSeed = await mldsa.exportKey("raw-seed", privateKey);
// rawSeed is an ArrayBuffer
```

#### Exporting a key as JWK

```js
// Export public key as JWK
const jwkPublic = await mldsa.exportKey("jwk", publicKey);
// jwkPublic is a JsonWebKey object
```

#### Importing a public key (raw format)

```js
// Import a public key from raw bytes
const importedPublicKey = await mldsa.importKey(
  "raw-public",
  rawPublicKey,
  { name: "ML-DSA-65" },
  true, // extractable
  ["verify"]
);
```

#### Importing a private key (seed format)

```js
// Import a private key from seed
const importedPrivateKey = await mldsa.importKey(
  "raw-seed",
  rawSeed,
  { name: "ML-DSA-65" },
  false, // not extractable
  ["sign"]
);
```

#### Importing a key from JWK

```js
// Import a public key from JWK
const importedJwkPublicKey = await mldsa.importKey(
  "jwk",
  jwkPublic,
  { name: "ML-DSA-65" },
  false,
  ["verify"]
);
```

SPKI and PKCS8 formats are also supported.

## API Reference

All API methods are asynchronous and return Promises. See [Modern Algorithms in the Web Cryptography API](https://wicg.github.io/webcrypto-modern-algos/) for details.

Types are given for ML-DSA-65, but the same methods work for ML-DSA-44 and ML-DSA-87:

### `mldsa.generateKey(algorithm, extractable, usages)`

- **algorithm**: `{ name: "ML-DSA-65" }` or `"ML-DSA-65"`
- **extractable**: `boolean` (for private key)
- **usages**: array of usages: `"sign"`, `"verify"`
- **Returns**: `{ publicKey, privateKey }` (both are `CryptoKey`)

### `mldsa.exportKey(format, key)`

- **format**: `"raw-public"`, `"raw-seed"`, `"jwk"`, `"pkcs8"` or `"spki"`
- **key**: `CryptoKey`
- **Returns**: `ArrayBuffer` or `JsonWebKey`

### `mldsa.importKey(format, keyData, algorithm, extractable, usages)`

- **format**: `"raw-public"`, `"raw-seed"`, `"jwk"`, `"pkcs8"` or `"spki"`
- **keyData**: `ArrayBuffer`, typed array, or `JsonWebKey`
- **algorithm**: `{ name: "ML-DSA-65" }` or `"ML-DSA-65"`
- **extractable**: `boolean`
- **usages**: array of usages
- **Returns**: `CryptoKey`

### `mldsa.sign(algorithm, key, data)`

- **algorithm**: `{ name: "ML-DSA-65", context? }` or `"ML-DSA-65"`
- **key**: private `CryptoKey`
- **data**: `ArrayBuffer` or typed array (data to sign)
- **Returns**: `ArrayBuffer` (signature)

### `mldsa.verify(algorithm, key, signature, data)`

- **algorithm**: `{ name: "ML-DSA-65", context? }` or `"ML-DSA-65"`
- **key**: public `CryptoKey`
- **signature**: `ArrayBuffer` or typed array
- **data**: `ArrayBuffer` or typed array (original data)
- **Returns**: `boolean` (true if signature is valid)

### `mldsa.getPublicKey(key, usages)`

- **key**: private `CryptoKey`
- **usages**: array of usages for the returned public key (`"verify"`)
- **Returns**: public `CryptoKey`

### `mldsa._isSupportedCryptoKey(key)`

Non-spec method to check if a `CryptoKey` was created by this library.
You can use it to distinguish WebCrypto's native keys from `mldsa-wasm` keys.

- **key**: `CryptoKey`
- **Returns**: `boolean`

### Types

- `CryptoKey`: Internal key object, not compatible with WebCrypto's `CryptoKey`.
- Usages: `"sign"`, `"verify"`
- Formats: `"raw-public"`, `"raw-seed"`, `"jwk"`, `"pkcs8"`, `"spki"`

## When WebCrypto API ships

Once the WebCrypto API supports ML-DSA natively (assuming the draft ships as-is), just switch `mldsa` to `crypto.subtle` and use the native API directly.

## Spec changes

Since the WebCrypto API draft is still evolving, this library may need updates to keep up with changes in the spec. The updates are not guaranteed (but I will try to keep up), and they may break compatibility with previous versions.

## Build Instructions

### Prerequisites

- [Emscripten](https://emscripten.org/) (for building WASM)
- `npm install` to install dev dependencies (`esbuild`, `typescript`, and `vitest`).

### Build

- Fetch mldsa-native sources**
   - The sources are included as a git submodule in `src/mldsa-native/`.
   - To initialize and update the submodule, run:
     ```sh
     git submodule update --init --recursive
     ```
- Run:
  ```sh
  npm run build
  ```
- This uses Emscripten to compile C sources, which puts the result into `src/build/wasm-module.js` (WASM inlined).
- Creates a single distributable file by combining `src/build/wasm-module.js` and `src/mldsa.ts` using `esbuild`, resulting in `dist/mldsa.js`.
- Creates TypeScript types in `types/mldsa.d.ts` by running `tsc`.

## Distribution

- The entire library is distributed as a single-file ES module: `dist/mldsa.js`.
- The WASM module is inlined, so no external files are needed.
- TypeScript types are in `types/mldsa.d.ts`.


## Supply chain security

_Fupply fain fufurity_. The whole WASM module is a scary-looking opaque encoded blob,
compiled by me from the code I got from GitHub (apparently used by AWS' Cryptography library
and other popular projects), npm-installed by you from the internets. I made this library
for my project and happily share it with you.

Nobody checks every line of code they `npm install`, instead they like to check checkboxes.

Here are some checkboxes:

- [x] `mldsa-native` is included as a git submodule instead of importing it directly into the source.
- [x] there are no modifications to the original `mldsa-native` code.
- [x] there are 0 (zero) non-dev dependencies in `package.json`.
- [x] the JavaScript code is not minified.
- [x] build artifacts (except for .o) are committed to the repository.
- [x] hardware security key is used for npm authentication when publishing.

If your company wants to pay to get some other checkboxes from me, please contact me directly.

## License

- WASM wrapper: MIT License
- mldsa-native: See [mldsa-native/LICENSE](src/mldsa-native/LICENSE)  (choice of MIT/Apache 2.0/etc.)

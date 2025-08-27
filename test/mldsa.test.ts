import { describe, it, expect } from "vitest";
import mldsa from "../dist/mldsa.js";
import TEST_VECTOR from "./testvector";

describe("mldsa API", () => {
  describe("Error cases", () => {
    it("should throw TypeError for unsupported algorithm", async () => {
      await expect(
        mldsa.generateKey("BAD-ALG", true, ["sign", "verify"])
      ).rejects.toThrow(expect.objectContaining({ name: "TypeError" }));
    });

    it("should throw SyntaxError for invalid key usages in generateKey", async () => {
      await expect(
        mldsa.generateKey({ name: "ML-DSA-65" }, true, ["badUsage"])
      ).rejects.toThrow(expect.objectContaining({ name: "SyntaxError" }));
    });

    it("should throw OperationError if key is not extractable in exportKey", async () => {
      const { privateKey } = await mldsa.generateKey(
        { name: "ML-DSA-65" },
        false,
        ["sign", "verify"]
      );
      await expect(mldsa.exportKey("raw-seed", privateKey)).rejects.toThrow(
        expect.objectContaining({ name: "OperationError" })
      );
    });

    it("should throw TypeError if exporting raw-public from private key", async () => {
      const { privateKey } = await mldsa.generateKey(
        { name: "ML-DSA-65" },
        true,
        ["sign", "verify"]
      );
      await expect(mldsa.exportKey("raw-public", privateKey)).rejects.toThrow(
        expect.objectContaining({ name: "TypeError" })
      );
    });

    it("should throw InvalidAccessError if exporting raw-seed from public key", async () => {
      const { publicKey } = await mldsa.generateKey(
        { name: "ML-DSA-65" },
        true,
        ["sign", "verify"]
      );
      await expect(mldsa.exportKey("raw-seed", publicKey)).rejects.toThrow(
        expect.objectContaining({ name: "InvalidAccessError" })
      );
    });

    it("should throw NotSupportedError for unknown export format", async () => {
      const { publicKey } = await mldsa.generateKey(
        { name: "ML-DSA-65" },
        true,
        ["sign", "verify"]
      );
      await expect(mldsa.exportKey("bad-format", publicKey)).rejects.toThrow(
        expect.objectContaining({ name: "NotSupportedError" })
      );
    });

    it("should throw SyntaxError for invalid usages in importKey raw-public", async () => {
      await expect(
        mldsa.importKey(
          "raw-public",
          new Uint8Array(32),
          { name: "ML-DSA-65" },
          true,
          ["badUsage"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "SyntaxError" }));
    });

    it("should throw TypeError for invalid data type in importKey raw-public", async () => {
      await expect(
        mldsa.importKey("raw-public", [1, 2, 3], { name: "ML-DSA-65" }, true, [
          "verify",
        ])
      ).rejects.toThrow(expect.objectContaining({ name: "TypeError" }));
    });

    it("should throw TypeError for invalid data type in importKey raw-seed", async () => {
      await expect(
        mldsa.importKey("raw-seed", [1, 2, 3], { name: "ML-DSA-65" }, true, [
          "sign",
        ])
      ).rejects.toThrow(expect.objectContaining({ name: "TypeError" }));
    });

    it("should throw SyntaxError for invalid usages in importKey raw-seed", async () => {
      await expect(
        mldsa.importKey(
          "raw-seed",
          new Uint8Array(32),
          { name: "ML-DSA-65" },
          true,
          ["badUsage"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "SyntaxError" }));
    });

    it("should throw DataError for invalid key length in importKey raw-seed", async () => {
      await expect(
        mldsa.importKey(
          "raw-seed",
          new Uint8Array(10),
          { name: "ML-DSA-65" },
          true,
          ["sign"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for non-object keyData in importKey jwk", async () => {
      await expect(
        mldsa.importKey("jwk", null, { name: "ML-DSA-65" }, true, ["sign"])
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for wrong kty in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "WRONG", alg: "ML-DSA-65", pub: "AA" },
          { name: "ML-DSA-65" },
          true,
          ["verify"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for wrong alg in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: "WRONG", pub: "AA" },
          { name: "ML-DSA-65" },
          true,
          ["verify"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for wrong alg in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: "WRONG", pub: "AA" },
          { name: "ML-DSA-65" },
          true,
          ["verify"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for wrong use in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: "ML-DSA-65", pub: "AA", use: "bad" },
          { name: "ML-DSA-65" },
          true,
          ["verify"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for wrong key_ops in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: "ML-DSA-65", pub: "AA", key_ops: "bad" },
          { name: "ML-DSA-65" },
          true,
          ["verify"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for wrong ext in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: "ML-DSA-65", pub: "AA", ext: false },
          { name: "ML-DSA-65" },
          true,
          ["verify"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for invalid private key length in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: "ML-DSA-65", pub: "AA", priv: "AA" },
          { name: "ML-DSA-65" },
          true,
          ["sign"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for invalid public key data in importKey jwk", async () => {
      // priv is valid length, but pub does not match
      const priv = btoa(String.fromCharCode(...new Uint8Array(32)));
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: "ML-DSA-65", pub: "WRONG", priv },
          { name: "ML-DSA-65" },
          true,
          ["sign"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for invalid private key format in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: "ML-DSA-65", pub: "AA", priv: "!!notbase64!!" },
          { name: "ML-DSA-65" },
          true,
          ["sign"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for invalid public key format in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: "ML-DSA-65", pub: "!!notbase64!!" },
          { name: "ML-DSA-65" },
          true,
          ["verify"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw NotSupportedError for unsupported key format in importKey", async () => {
      await expect(
        mldsa.importKey("bad-format", {}, { name: "ML-DSA-65" }, true, ["sign"])
      ).rejects.toThrow(expect.objectContaining({ name: "NotSupportedError" }));
    });

    it("should throw InvalidAccessError for wrong type in sign", async () => {
      await expect(
        mldsa.sign({ name: "ML-DSA-65" }, {}, new Uint8Array(32))
      ).rejects.toThrow(
        expect.objectContaining({ name: "InvalidAccessError" })
      );
    });

    // Test for invalid signature verification
    it("should return false for invalid signature length in verify", async () => {
      const { publicKey } = await mldsa.generateKey(
        { name: "ML-DSA-65" },
        true,
        ["verify"]
      );
      const result = await mldsa.verify(
        { name: "ML-DSA-65" },
        publicKey,
        new Uint8Array(111),
        new Uint8Array(32)
      );
      expect(result).toBe(false);
    });

    // Decapsulation failure is hard to simulate unless the WASM module is patched to fail
  });
  it("should generate a key pair", async () => {
    const { publicKey, privateKey } = await mldsa.generateKey(
      { name: "ML-DSA-65" },
      true,
      ["sign", "verify"]
    );
    expect(publicKey).toBeDefined();
    expect(privateKey).toBeDefined();
    expect(publicKey.type).toBe("public");
    expect(privateKey.type).toBe("private");
  });

  it("should get public key from private key", async () => {
    const { publicKey, privateKey } = await mldsa.generateKey(
      { name: "ML-DSA-65" },
      true,
      ["sign", "verify"]
    );
    const derived = await mldsa.getPublicKey(privateKey, ["verify"]);
    const raw1 = await mldsa.exportKey("raw-public", publicKey);
    const raw2 = await mldsa.exportKey("raw-public", derived);
    expect(new Uint8Array(raw1)).toEqual(new Uint8Array(raw2));
  });

  it("should export and import public key (raw-public)", async () => {
    const { publicKey } = await mldsa.generateKey({ name: "ML-DSA-65" }, true, [
      "verify",
    ]);
    const raw = await mldsa.exportKey("raw-public", publicKey);
    expect(raw).toBeInstanceOf(ArrayBuffer);

    const imported = await mldsa.importKey(
      "raw-public",
      raw,
      { name: "ML-DSA-65" },
      true,
      ["verify"]
    );
    expect(imported.type).toBe("public");
  });

  it("should export and import public key (jwk)", async () => {
    const { publicKey } = await mldsa.generateKey({ name: "ML-DSA-65" }, true, [
      "verify",
    ]);
    const jwk = await mldsa.exportKey("jwk", publicKey);
    expect(jwk).toHaveProperty("kty", "AKP");
    expect(jwk).toHaveProperty("alg", "ML-DSA-65");
    expect(jwk).toHaveProperty("pub");
    const imported = await mldsa.importKey(
      "jwk",
      jwk,
      { name: "ML-DSA-65" },
      true,
      ["verify"]
    );
    expect(imported.type).toBe("public");
  });

  it("should export and import private key (jwk)", async () => {
    const { privateKey } = await mldsa.generateKey(
      { name: "ML-DSA-65" },
      true,
      ["sign"]
    );
    const jwk = await mldsa.exportKey("jwk", privateKey);
    expect(jwk).toHaveProperty("kty", "AKP");
    expect(jwk).toHaveProperty("alg", "ML-DSA-65");
    expect(jwk).toHaveProperty("priv");
    expect(jwk).toHaveProperty("pub");
    const imported = await mldsa.importKey(
      "jwk",
      jwk,
      { name: "ML-DSA-65" },
      true,
      ["sign"]
    );
    expect(imported.type).toBe("private");
  });

  it("should export and import private key (raw-seed)", async () => {
    const { privateKey } = await mldsa.generateKey(
      { name: "ML-DSA-65" },
      true,
      ["sign"]
    );
    const rawSeed = await mldsa.exportKey("raw-seed", privateKey);
    expect(rawSeed).toBeInstanceOf(ArrayBuffer);
    // Import back
    const imported = await mldsa.importKey(
      "raw-seed",
      rawSeed,
      { name: "ML-DSA-65" },
      true,
      ["sign"]
    );
    expect(imported.type).toBe("private");
    // Export again and compare
    const rawSeed2 = await mldsa.exportKey("raw-seed", imported);
    expect(new Uint8Array(rawSeed2)).toEqual(new Uint8Array(rawSeed));
  });

  // Decode PEM, convert to DER ArrayBuffer.
  const pemToDer = (armor: string) => {
    const b64 = armor.replace(
      /-----BEGIN (?:PUBLIC|PRIVATE) KEY-----|-----END (?:PUBLIC|PRIVATE) KEY-----|\s+/g,
      ""
    );
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
  };

  // Example keys from
  // https://datatracker.ietf.org/doc/html/draft-ietf-lamps-dilithium-certificates-12
  const exampleSPKIPublicKey = `
-----BEGIN PUBLIC KEY-----
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
HgLy6ERP
-----END PUBLIC KEY-----
    `;

  const examplePKCS8PrivateKey = `
    -----BEGIN PRIVATE KEY-----
    MDQCAQAwCwYJYIZIAWUDBAMSBCKAIAABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZ
    GhscHR4f
    -----END PRIVATE KEY-----
    `;

  it("should import and export a SPKI public key", async () => {
    const imported = await mldsa.importKey(
      "spki",
      pemToDer(exampleSPKIPublicKey),
      { name: "ML-DSA-65" },
      true,
      ["verify"]
    );
    expect(imported.type).toBe("public");
    const raw = await mldsa.exportKey("raw-public", imported);
    expect(raw).toBeInstanceOf(ArrayBuffer);

    // Export SPKI again and compare
    const spki = await mldsa.exportKey("spki", imported);
    expect(new Uint8Array(spki)).toEqual(
      new Uint8Array(pemToDer(exampleSPKIPublicKey))
    );
  });

  it("should import and export a PKCS8 private key", async () => {
    const imported = await mldsa.importKey(
      "pkcs8",
      pemToDer(examplePKCS8PrivateKey),
      { name: "ML-DSA-65" },
      true,
      ["sign"]
    );
    expect(imported.type).toBe("private");
    const raw = await mldsa.exportKey("raw-seed", imported);
    expect(raw).toBeInstanceOf(ArrayBuffer);

    // Export PKCS8 again and compare
    const pkcs8 = await mldsa.exportKey("pkcs8", imported);
    expect(new Uint8Array(pkcs8)).toEqual(
      new Uint8Array(pemToDer(examplePKCS8PrivateKey))
    );
  });

  it("should sign and verify a message", async () => {
    const { publicKey, privateKey } = await mldsa.generateKey(
      { name: "ML-DSA-65" },
      true,
      ["sign", "verify"]
    );
    const message = new TextEncoder().encode("Hello, ML-DSA!");
    const signature = await mldsa.sign(
      { name: "ML-DSA-65" },
      privateKey,
      message
    );
    expect(signature).toBeInstanceOf(ArrayBuffer);

    const isValid = await mldsa.verify(
      { name: "ML-DSA-65" },
      publicKey,
      signature,
      message
    );
    expect(isValid).toBe(true);
  });

  it("should sign and verify a long message", async () => {
    const { publicKey, privateKey } = await mldsa.generateKey(
      { name: "ML-DSA-65" },
      true,
      ["sign", "verify"]
    );
    const message = new Uint8Array(20 * 1024 * 1024); // 20 MiB
    const signature = await mldsa.sign(
      { name: "ML-DSA-65" },
      privateKey,
      message
    );
    expect(signature).toBeInstanceOf(ArrayBuffer);

    const isValid = await mldsa.verify(
      { name: "ML-DSA-65" },
      publicKey,
      signature,
      message
    );
    expect(isValid).toBe(true);
  });

  it("should verify known test vector signature 1", async () => {
    const publicKey = await mldsa.importKey(
      "raw-public",
      TEST_VECTOR.publicKey,
      { name: "ML-DSA-65" },
      true,
      ["verify"]
    );

    // Test the first test case
    const testCase = TEST_VECTOR.results[0];
    const isValid = await mldsa.verify(
      { name: "ML-DSA-65" },
      publicKey,
      testCase.signature,
      testCase.message
    );
    expect(isValid).toBe(true);
  });

  it("should verify known test vector signature 2", async () => {
    const publicKey = await mldsa.importKey(
      "raw-public",
      TEST_VECTOR.publicKey,
      { name: "ML-DSA-65" },
      true,
      ["verify"]
    );

    // Test the first test case
    const testCase = TEST_VECTOR.results[1];
    const isValid = await mldsa.verify(
      { name: "ML-DSA-65", context: testCase.context },
      publicKey,
      testCase.signature,
      testCase.message
    );
    expect(isValid).toBe(true);
  });

  it("should not be possible to clone public key", async () => {
    await expect(
      mldsa
        .generateKey({ name: "ML-DSA-65" }, true, ["sign", "verify"])
        .then((k) => structuredClone(k.publicKey))
    ).rejects.toThrow(/clone/);
  });

  it("should not be possible to clone private key", async () => {
    await expect(
      mldsa
        .generateKey({ name: "ML-DSA-65" }, true, ["sign", "verify"])
        .then((k) => structuredClone(k.privateKey))
    ).rejects.toThrow(/clone/);
  });

  it("should return public key from private key", async () => {
    const { publicKey, privateKey } = await mldsa.generateKey(
      { name: "ML-DSA-65" },
      true,
      ["sign", "verify"]
    );
    const pub2 = await mldsa.getPublicKey(privateKey, ["verify"]);
    const raw1 = await mldsa.exportKey("raw-public", publicKey);
    const raw2 = await mldsa.exportKey("raw-public", pub2);
    expect(new Uint8Array(raw1)).toEqual(new Uint8Array(raw2));
  });

  it("_isSupportedCryptoKey should return true for keys generated by module", async () => {
    const { privateKey } = await mldsa.generateKey(
      { name: "ML-DSA-65" },
      true,
      ["sign", "verify"]
    );
    expect(mldsa._isSupportedCryptoKey(privateKey)).toBe(true);
  });

  it("_isSupportedCryptoKey should return false for keys not generated by module", async () => {
    const { privateKey } = await crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveBits"]
    );
    expect(mldsa._isSupportedCryptoKey(privateKey)).toBe(false);
  });
});

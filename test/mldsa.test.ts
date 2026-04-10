import { describe, it, expect } from "vitest";
import mldsa from "../dist/mldsa.js";
import testVectors from "./testvector";
import exampleKeys from "./examplekeys";

const names = ["ML-DSA-44", "ML-DSA-65", "ML-DSA-87"] as const;

describe.each(names)("mldsa API (%s)", (name) => {
  describe("Error cases", () => {
    it("should throw TypeError for unsupported algorithm", async () => {
      await expect(
        mldsa.generateKey("BAD-ALG", true, ["sign", "verify"])
      ).rejects.toThrow(expect.objectContaining({ name: "TypeError" }));
    });

    it("should throw SyntaxError for invalid key usages in generateKey", async () => {
      await expect(
        mldsa.generateKey({ name }, true, ["badUsage"])
      ).rejects.toThrow(expect.objectContaining({ name: "SyntaxError" }));
    });

    it("should throw OperationError if key is not extractable in exportKey", async () => {
      const { privateKey } = await mldsa.generateKey(
        { name },
        false,
        ["sign", "verify"]
      );
      await expect(mldsa.exportKey("raw-seed", privateKey)).rejects.toThrow(
        expect.objectContaining({ name: "OperationError" })
      );
    });

    it("should throw TypeError if exporting raw-public from private key", async () => {
      const { privateKey } = await mldsa.generateKey(
        { name },
        true,
        ["sign", "verify"]
      );
      await expect(mldsa.exportKey("raw-public", privateKey)).rejects.toThrow(
        expect.objectContaining({ name: "TypeError" })
      );
    });

    it("should throw InvalidAccessError if exporting raw-seed from public key", async () => {
      const { publicKey } = await mldsa.generateKey(
        { name },
        true,
        ["sign", "verify"]
      );
      await expect(mldsa.exportKey("raw-seed", publicKey)).rejects.toThrow(
        expect.objectContaining({ name: "InvalidAccessError" })
      );
    });

    it("should throw NotSupportedError for unknown export format", async () => {
      const { publicKey } = await mldsa.generateKey(
        { name },
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
          { name },
          true,
          ["badUsage"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "SyntaxError" }));
    });

    it("should throw TypeError for invalid data type in importKey raw-public", async () => {
      await expect(
        mldsa.importKey("raw-public", [1, 2, 3], { name }, true, [
          "verify",
        ])
      ).rejects.toThrow(expect.objectContaining({ name: "TypeError" }));
    });

    it("should throw TypeError for invalid data type in importKey raw-seed", async () => {
      await expect(
        mldsa.importKey("raw-seed", [1, 2, 3], { name }, true, [
          "sign",
        ])
      ).rejects.toThrow(expect.objectContaining({ name: "TypeError" }));
    });

    it("should throw SyntaxError for invalid usages in importKey raw-seed", async () => {
      await expect(
        mldsa.importKey(
          "raw-seed",
          new Uint8Array(32),
          { name },
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
          { name },
          true,
          ["sign"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for non-object keyData in importKey jwk", async () => {
      await expect(
        mldsa.importKey("jwk", null, { name }, true, ["sign"])
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for wrong kty in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "WRONG", alg: name, pub: "AA" },
          { name },
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
          { name },
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
          { name },
          true,
          ["verify"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for wrong use in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: name, pub: "AA", use: "bad" },
          { name },
          true,
          ["verify"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for wrong key_ops in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: name, pub: "AA", key_ops: "bad" },
          { name },
          true,
          ["verify"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for wrong ext in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: name, pub: "AA", ext: false },
          { name },
          true,
          ["verify"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for invalid private key length in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: name, pub: "AA", priv: "AA" },
          { name },
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
          { kty: "AKP", alg: name, pub: "WRONG", priv },
          { name },
          true,
          ["sign"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for invalid private key format in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: name, pub: "AA", priv: "!!notbase64!!" },
          { name },
          true,
          ["sign"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw DataError for invalid public key format in importKey jwk", async () => {
      await expect(
        mldsa.importKey(
          "jwk",
          { kty: "AKP", alg: name, pub: "!!notbase64!!" },
          { name },
          true,
          ["verify"]
        )
      ).rejects.toThrow(expect.objectContaining({ name: "DataError" }));
    });

    it("should throw NotSupportedError for unsupported key format in importKey", async () => {
      await expect(
        mldsa.importKey("bad-format", {}, { name }, true, ["sign"])
      ).rejects.toThrow(expect.objectContaining({ name: "NotSupportedError" }));
    });

    it("should throw InvalidAccessError for wrong type in sign", async () => {
      await expect(
        mldsa.sign({ name }, {}, new Uint8Array(32))
      ).rejects.toThrow(
        expect.objectContaining({ name: "InvalidAccessError" })
      );
    });

    // Test for invalid signature verification
    it("should return false for invalid signature length in verify", async () => {
      const { publicKey } = await mldsa.generateKey(
        { name },
        true,
        ["verify"]
      );
      const result = await mldsa.verify(
        { name },
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
      { name },
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
      { name },
      true,
      ["sign", "verify"]
    );
    const derived = await mldsa.getPublicKey(privateKey, ["verify"]);
    const raw1 = await mldsa.exportKey("raw-public", publicKey);
    const raw2 = await mldsa.exportKey("raw-public", derived);
    expect(new Uint8Array(raw1)).toEqual(new Uint8Array(raw2));
  });

  it("should export and import public key (raw-public)", async () => {
    const { publicKey } = await mldsa.generateKey({ name }, true, [
      "verify",
    ]);
    const raw = await mldsa.exportKey("raw-public", publicKey);
    expect(raw).toBeInstanceOf(ArrayBuffer);

    const imported = await mldsa.importKey(
      "raw-public",
      raw,
      { name },
      true,
      ["verify"]
    );
    expect(imported.type).toBe("public");
  });

  it("should export and import public key (jwk)", async () => {
    const { publicKey } = await mldsa.generateKey({ name }, true, [
      "verify",
    ]);
    const jwk = await mldsa.exportKey("jwk", publicKey);
    expect(jwk).toHaveProperty("kty", "AKP");
    expect(jwk).toHaveProperty("alg", name);
    expect(jwk).toHaveProperty("pub");
    const imported = await mldsa.importKey(
      "jwk",
      jwk,
      { name },
      true,
      ["verify"]
    );
    expect(imported.type).toBe("public");
  });

  it("should export and import private key (jwk)", async () => {
    const { privateKey } = await mldsa.generateKey(
      { name },
      true,
      ["sign"]
    );
    const jwk = await mldsa.exportKey("jwk", privateKey);
    expect(jwk).toHaveProperty("kty", "AKP");
    expect(jwk).toHaveProperty("alg", name);
    expect(jwk).toHaveProperty("priv");
    expect(jwk).toHaveProperty("pub");
    const imported = await mldsa.importKey(
      "jwk",
      jwk,
      { name },
      true,
      ["sign"]
    );
    expect(imported.type).toBe("private");
  });

  it("should export and import private key (raw-seed)", async () => {
    const { privateKey } = await mldsa.generateKey(
      { name },
      true,
      ["sign"]
    );
    const rawSeed = await mldsa.exportKey("raw-seed", privateKey);
    expect(rawSeed).toBeInstanceOf(ArrayBuffer);
    // Import back
    const imported = await mldsa.importKey(
      "raw-seed",
      rawSeed,
      { name },
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

  it("should import and export a SPKI public key", async () => {
    const imported = await mldsa.importKey(
      "spki",
      pemToDer(exampleKeys.SPKIPublicKey[name]),
      { name },
      true,
      ["verify"]
    );
    expect(imported.type).toBe("public");
    const raw = await mldsa.exportKey("raw-public", imported);
    expect(raw).toBeInstanceOf(ArrayBuffer);

    // Export SPKI again and compare
    const spki = await mldsa.exportKey("spki", imported);
    expect(new Uint8Array(spki)).toEqual(
      new Uint8Array(pemToDer(exampleKeys.SPKIPublicKey[name]))
    );
  });

  it("should import and export a PKCS8 private key", async () => {
    const imported = await mldsa.importKey(
      "pkcs8",
      pemToDer(exampleKeys.PKCS8PrivateKey[name]),
      { name },
      true,
      ["sign"]
    );
    expect(imported.type).toBe("private");
    const raw = await mldsa.exportKey("raw-seed", imported);
    expect(raw).toBeInstanceOf(ArrayBuffer);

    // Export PKCS8 again and compare
    const pkcs8 = await mldsa.exportKey("pkcs8", imported);
    expect(new Uint8Array(pkcs8)).toEqual(
      new Uint8Array(pemToDer(exampleKeys.PKCS8PrivateKey[name]))
    );
  });

  it("should sign and verify a message", async () => {
    const { publicKey, privateKey } = await mldsa.generateKey(
      { name },
      true,
      ["sign", "verify"]
    );
    const message = new TextEncoder().encode("Hello, ML-DSA!");
    const signature = await mldsa.sign(
      { name },
      privateKey,
      message
    );
    expect(signature).toBeInstanceOf(ArrayBuffer);

    const isValid = await mldsa.verify(
      { name },
      publicKey,
      signature,
      message
    );
    expect(isValid).toBe(true);
  });

  it("should sign and verify a long message", async () => {
    const { publicKey, privateKey } = await mldsa.generateKey(
      { name },
      true,
      ["sign", "verify"]
    );
    const message = new Uint8Array(20 * 1024 * 1024); // 20 MiB
    const signature = await mldsa.sign(
      { name },
      privateKey,
      message
    );
    expect(signature).toBeInstanceOf(ArrayBuffer);

    const isValid = await mldsa.verify(
      { name },
      publicKey,
      signature,
      message
    );
    expect(isValid).toBe(true);
  });

  it("should verify known test vector signature 1", async () => {
    const publicKey = await mldsa.importKey(
      "raw-public",
      testVectors[name].publicKey,
      { name },
      true,
      ["verify"]
    );

    // Test the first test case
    const testCase = testVectors[name].results[0];
    const isValid = await mldsa.verify(
      { name },
      publicKey,
      testCase.signature,
      testCase.message
    );
    expect(isValid).toBe(true);
  });

  it("should verify known test vector signature 2", async () => {
    const publicKey = await mldsa.importKey(
      "raw-public",
      testVectors[name].publicKey,
      { name },
      true,
      ["verify"]
    );

    // Test the first test case
    const testCase = testVectors[name].results[1];
    const isValid = await mldsa.verify(
      { name, context: testCase.context },
      publicKey,
      testCase.signature,
      testCase.message
    );
    expect(isValid).toBe(true);
  });

  it("should not be possible to clone public key", async () => {
    await expect(
      mldsa
        .generateKey({ name }, true, ["sign", "verify"])
        .then((k) => structuredClone(k.publicKey))
    ).rejects.toThrow();
  });

  it("should not be possible to clone private key", async () => {
    await expect(
      mldsa
        .generateKey({ name }, true, ["sign", "verify"])
        .then((k) => structuredClone(k.privateKey))
    ).rejects.toThrow();
  });

  it("should return public key from private key", async () => {
    const { publicKey, privateKey } = await mldsa.generateKey(
      { name },
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
      { name },
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

// go run genvec.go > ../testvector.ts

package main

import (
	"crypto/rand"
	"fmt"

	"github.com/cloudflare/circl/sign/mldsa/mldsa65"
)

func toInts(b []byte) string {
	s := "new Uint8Array(["
	for i, v := range b {
		if i > 0 {
			s += ", "
		}
		s += fmt.Sprintf("%d", v)
	}
	s += "])"
	return s
}

func main() {
	pk, sk, _ := mldsa65.GenerateKey(rand.Reader)

	results := []struct {
		message   []byte
		context   []byte
		signature []byte
	}{
		{
			message:   []byte("Test message"),
			context:   nil,
			signature: make([]byte, mldsa65.SignatureSize),
		},
		{
			message:   []byte("Test message"),
			context:   []byte("SampleContext"),
			signature: make([]byte, mldsa65.SignatureSize),
		},
	}

	for _, v := range results {
		if err := mldsa65.SignTo(sk, v.message, v.context, true, v.signature); err != nil {
			panic(err)
		}
	}

	fmt.Printf("const TEST_VECTOR = {\n")
	fmt.Printf("    privateKey: %s,\n", toInts(sk.Bytes()))
	fmt.Printf("    publicKey: %s,\n", toInts(pk.Bytes()))
	fmt.Printf("    results: [\n")
	for _, v := range results {
		fmt.Printf("        { message: %s, context: %s, signature: %s },\n", toInts(v.message), toInts(v.context), toInts(v.signature))
	}
	fmt.Printf("    ],\n")
	fmt.Printf("}\nexport default TEST_VECTOR;\n")

}

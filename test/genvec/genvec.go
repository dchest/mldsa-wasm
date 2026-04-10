// go run genvec.go > ../testvector.ts

package main

import (
	"crypto/rand"
	"fmt"

	"github.com/cloudflare/circl/sign/mldsa/mldsa44"
	"github.com/cloudflare/circl/sign/mldsa/mldsa65"
	"github.com/cloudflare/circl/sign/mldsa/mldsa87"
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

func generateTestVector44() {
	pk, sk, _ := mldsa44.GenerateKey(rand.Reader)
	results := []struct {
		message   []byte
		context   []byte
		signature []byte
	}{
		{
			message:   []byte("Test message"),
			context:   nil,
			signature: make([]byte, mldsa44.SignatureSize),
		},
		{
			message:   []byte("Test message"),
			context:   []byte("SampleContext"),
			signature: make([]byte, mldsa44.SignatureSize),
		},
	}
	for _, v := range results {
		if err := mldsa44.SignTo(sk, v.message, v.context, true, v.signature); err != nil {
			panic(err)
		}
	}
	fmt.Printf("const testVector44 = {\n")
	fmt.Printf("    privateKey: %s,\n", toInts(sk.Bytes()))
	fmt.Printf("    publicKey: %s,\n", toInts(pk.Bytes()))
	fmt.Printf("    results: [\n")

	for _, v := range results {
		fmt.Printf("        { message: %s, context: %s, signature: %s },\n", toInts(v.message), toInts(v.context), toInts(v.signature))
	}
	fmt.Printf("    ],\n}\n\n")
}

func generateTestVector65() {
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
	fmt.Printf("const testVector65 = {\n")
	fmt.Printf("    privateKey: %s,\n", toInts(sk.Bytes()))
	fmt.Printf("    publicKey: %s,\n", toInts(pk.Bytes()))
	fmt.Printf("    results: [\n")

	for _, v := range results {
		fmt.Printf("        { message: %s, context: %s, signature: %s },\n", toInts(v.message), toInts(v.context), toInts(v.signature))
	}
	fmt.Printf("    ],\n}\n\n")
}

func generateTestVector87() {
	pk, sk, _ := mldsa87.GenerateKey(rand.Reader)
	results := []struct {
		message   []byte
		context   []byte
		signature []byte
	}{
		{
			message:   []byte("Test message"),
			context:   nil,
			signature: make([]byte, mldsa87.SignatureSize),
		},
		{
			message:   []byte("Test message"),
			context:   []byte("SampleContext"),
			signature: make([]byte, mldsa87.SignatureSize),
		},
	}
	for _, v := range results {
		if err := mldsa87.SignTo(sk, v.message, v.context, true, v.signature); err != nil {
			panic(err)
		}
	}
	fmt.Printf("const testVector87 = {\n")
	fmt.Printf("    privateKey: %s,\n", toInts(sk.Bytes()))
	fmt.Printf("    publicKey: %s,\n", toInts(pk.Bytes()))
	fmt.Printf("    results: [\n")

	for _, v := range results {
		fmt.Printf("        { message: %s, context: %s, signature: %s },\n", toInts(v.message), toInts(v.context), toInts(v.signature))
	}
	fmt.Printf("    ],\n}\n\n")
}

func main() {
	generateTestVector44()
	generateTestVector65()
	generateTestVector87()
	fmt.Printf("const testVectors = { \"ML-DSA-44\": testVector44, \"ML-DSA-65\": testVector65, \"ML-DSA-87\": testVector87 };\n")
	fmt.Printf("export default testVectors;\n")
}

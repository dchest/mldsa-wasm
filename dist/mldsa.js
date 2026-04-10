// src/build/wasm-module.js
async function MLDSA65Module(moduleArg = {}) {
  var moduleRtn;
  var Module = moduleArg;
  var ENVIRONMENT_IS_WEB = !!globalThis.window;
  var ENVIRONMENT_IS_WORKER = !!globalThis.WorkerGlobalScope;
  var ENVIRONMENT_IS_NODE = globalThis.process?.versions?.node && globalThis.process?.type != "renderer";
  var _scriptName = import.meta.url;
  var scriptDirectory = "";
  var readAsync, readBinary;
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    try {
      scriptDirectory = new URL(".", _scriptName).href;
    } catch {
    }
    {
      if (ENVIRONMENT_IS_WORKER) {
        readBinary = (url) => {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, false);
          xhr.responseType = "arraybuffer";
          xhr.send(null);
          return new Uint8Array(xhr.response);
        };
      }
      readAsync = async (url) => {
        if (isFileURI(url)) {
          return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = () => {
              if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                resolve(xhr.response);
                return;
              }
              reject(xhr.status);
            };
            xhr.onerror = reject;
            xhr.send(null);
          });
        }
        var response = await fetch(url, { credentials: "same-origin" });
        if (response.ok) {
          return response.arrayBuffer();
        }
        throw new Error(response.status + " : " + response.url);
      };
    }
  } else {
  }
  var out = console.log.bind(console);
  var err = console.error.bind(console);
  var wasmBinary;
  var ABORT = false;
  var isFileURI = (filename) => filename.startsWith("file://");
  function binaryDecode(bin) {
    for (var i2 = 0, l = bin.length, o = new Uint8Array(l), c; i2 < l; ++i2) {
      c = bin.charCodeAt(i2);
      o[i2] = ~c >> 8 & c;
    }
    return o;
  }
  var readyPromiseResolve, readyPromiseReject;
  var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
  var HEAP64, HEAPU64;
  var runtimeInitialized = false;
  function updateMemoryViews() {
    var b = wasmMemory.buffer;
    Module["HEAP8"] = HEAP8 = new Int8Array(b);
    HEAP16 = new Int16Array(b);
    Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
    HEAPU16 = new Uint16Array(b);
    HEAP32 = new Int32Array(b);
    HEAPU32 = new Uint32Array(b);
    HEAPF32 = new Float32Array(b);
    HEAPF64 = new Float64Array(b);
    HEAP64 = new BigInt64Array(b);
    HEAPU64 = new BigUint64Array(b);
  }
  function preRun() {
  }
  function initRuntime() {
    runtimeInitialized = true;
    wasmExports["c"]();
  }
  function postRun() {
  }
  function abort(what) {
    what = "Aborted(" + what + ")";
    err(what);
    ABORT = true;
    what += ". Build with -sASSERTIONS for more info.";
    var e = new WebAssembly.RuntimeError(what);
    readyPromiseReject?.(e);
    throw e;
  }
  var wasmBinaryFile;
  function findWasmBinary() {
    return binaryDecode('\0asm\0\0\0n`\x7F\0`\x7F\x7F\0`\x7F\x7F\x7F\0`\x7F\x7F`\x7F\x7F\x7F\x7F\0`\x7F\x7F\x7F\x7F\x7F\x7F\0`\x7F\x7F\x7F`\x7F\x7F\x7F\x7F`\x07\x7F\x7F\x7F\x7F\x7F\x7F\x7F\0`	\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\0`\x7F\x7F\x7F\x7F\x7F\0`\0\x7F`\x07\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F`\b\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F\x7F`\0\0\x07aa\0>=\0\0\0\0\0\x07\0\0\b\0	\0\0\0\0\n\b\0\0\v\0\f\r\x07\x07\x85\x80\x80\b\x7FA\xF0\x9B\v\x07)\nb\0c\0=d\0<e\0;f\0:g\x005h\x006i\x009j\x008k\x007\f\n\x92\xDD=\xE9\x7F@ E\r\0 \0 j!\0 Aq!A\0! AO@ A|q!\bA\0!@ \0 j" -\0\0  j-\0\0s:\0\0 \0 Ar"j" -\0\0  j-\0\0s:\0\0 \0 Ar"j" -\0\0  j-\0\0s:\0\0 \0 Ar"j" -\0\0  j-\0\0s:\0\0 Aj! Aj" \bG\r\0\v E\r\v@ \0 j" -\0\0  j-\0\0s:\0\0 Aj! \x07Aj"\x07 G\r\0\v\v\v\xD8\f.~\x7F \0)\xC0! \0)\xB8! \0)\xB0! \0)\xA8! \0)\xA0! \0)\x98! \0)\x90! \0)\x88!\b \0)\x80! \0)x! \0)p! \0)h!	 \0)`! \0)X! \0)P!\n \0)H!\x07 \0)@! \0)8! \0)0! \0)(!\v \0) ! \0)!\r \0)!\f \0)\b! \0)\0!@  \v\x85 \n\x85 \x85 \x85" \f \x85 \x85 \b\x85 \x85"B\x89\x85"\x1B \x85B\x89" \x07 \x85 \x85 \x85 \x85"   \x85 \x85 \x85 \x85"B\x89\x85" \x85B)\x89"B\x7F\x85\x83 \r \x85 	\x85 \x85 \x85"! B\x89\x85" \x85B\'\x89"\x85"#  \n\x85B\x89"\n  !B\x89 \x85"\x85B=\x89"  \x1B\x85B-\x89"B\x7F\x85\x83\x85"!\x85  B\x89 \x85" 	\x85B\x89"	  \x85B\x89"  \x85B\b\x89"B\x7F\x85\x83\x85" \x85  \x1B\x85B\n\x89"  \x85B8\x89"  \b\x85B\x89"\bB\x7F\x85\x83\x85"$\x85  \x85B+\x89"  \x85B\x89"  \x85B\x89"B\x7F\x85\x83\x85"%\x85"&B\x89  \x85" /At"0)\xF0   \x1B\x85B,\x89"B\x7F\x85\x83\x85\x85""  \f\x85B>\x89"\f   \x85B7\x89"B\x7F\x85\x83\x85"\'  \x1B\x85B\x89" 	  \x85B\x89"B\x7F\x85\x83\x85"(  \r\x85B\x89" \n  \x07\x85B\x89"\x07B\x7F\x85\x83\x85")  \x85B\x1B\x89"   \v\x85B$\x89"B\x7F\x85\x83\x85"\v\x85\x85\x85\x85"\x85"  \nB\x7F\x85\x83 \x07\x85"\n\x85B,\x89"\x1B " \x07 B\x7F\x85\x83 \x85""  \fB\x7F\x85\x83 \x85"\x07  B\x7F\x85\x83 \x85"*  B\x7F\x85\x83 \x85"+  B\x7F\x85\x83 \x85",\x85\x85\x85\x85"\r  	B\x7F\x85\x83 \x85"	  B\x7F\x85\x83 \x85"  B\x7F\x85\x83 \x85" \b B\x7F\x85\x83 \x85"- \n\x85\x85\x85\x85"B\x89\x85"\x85"B\x7F\x85\x83 \x07  B\x7F\x85\x83 \b\x85".  B\x7F\x85\x83 \x85"   B\x7F\x85\x83\x85" \f B\x7F\x85\x83 \x85"\b  B\x7F\x85\x83 \x85"\x85\x85\x85\x85" B\x89\x85"\x07\x85B\x89"\x85!  \x85B\x89" \rB\x89 &\x85"\r \x85B7\x89" B\x89 \x85"\f %\x85B>\x89"B\x7F\x85\x83\x85! \v \x85B)\x89"  B\x7F\x85\x83\x85! \x07 +\x85B\'\x89"  B\x7F\x85\x83\x85!  B\x7F\x85\x83 \x85!  B\x7F\x85\x83 \x85! \b \r\x85B8\x89"\b  )\x85B$\x89" \x07 ,\x85B\x1B\x89"B\x7F\x85\x83\x85! \f $\x85B\x89"  \bB\x7F\x85\x83\x85! 	 \x85B\n\x89"	 \b B\x7F\x85\x83\x85!\b  	B\x7F\x85\x83 \x85! 	 B\x7F\x85\x83 \x85!  \'\x85B\x89" \f !\x85B\x89"\n  \x85B\x89"B\x7F\x85\x83\x85! \x07 *\x85B\b\x89"  B\x7F\x85\x83\x85!	 \r \x85B\x89"\v  B\x7F\x85\x83\x85!  \vB\x7F\x85\x83 \n\x85! \v \nB\x7F\x85\x83 \x85!\n \f #\x85B=\x89" \x07 "\x85B\x89"\v  \r\x85B\x89"B\x7F\x85\x83\x85!\x07  -\x85B-\x89"  B\x7F\x85\x83\x85!  (\x85B\x89"  B\x7F\x85\x83\x85!  B\x7F\x85\x83 \v\x85!  \vB\x7F\x85\x83 \x85!\v \r .\x85B\x89"  B\x7F\x85\x83\x85!\r \f  \x85B+\x89"  B\x7F\x85\x83\x85!\f  B\x7F\x85\x83 \x1B\x85! 0)\xF8  \x1BB\x7F\x85\x83\x85 \x85! /AI /Aj!/\r\0\v \0 7\xC0 \0 7\xB8 \0 7\xB0 \0 7\xA8 \0 7\xA0 \0 7\x98 \0 7\x90 \0 \b7\x88 \0 7\x80 \0 7x \0 7p \0 	7h \0 7` \0 7X \0 \n7P \0 \x077H \0 7@ \0 78 \0 70 \0 \v7( \0 7  \0 \r7 \0 \f7 \0 7\b \0 7\0\v}\x7F@ A\x88 \0(\xC8"k"I\r\0 \0    \0  j!A\0!  k"A\x88I\r\0@ \0 A\0A\x88 \0 A\x88j! A\x88k"A\x87K\r\0\v\v \0    \0  j6\xC8\v\x8A\x7F~@ \0 At"j  j4\0  j4\0~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>\0 \0 Ar"j  j4\0  j4\0~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>\0 Aj"A\x80G\r\0\v\v\x9D\x7F~A\xFF!@ \0 Atj" (" (\0"j6\0   k\xACA\0 At(\x80\bk\xAC~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88> Ak! A\xFEI Aj!\r\0\vA\xFF\0!@ \0 Atj" (\b" (\0"j6\0  (\f"\x07 ("\bj6A\0! A\0 At(\x80\bk\xAC"  k\xAC~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>\b  \b \x07k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>\f Ak! A\xFCI Aj!\r\0\vA?!@ \0 Atj" (" (\0"j6\0  ("\x07 ("\bj6  ("	 (\b"\nj6\b  ("\v (\f"\fj6\fA\0! A\0 At(\x80\bk\xAC"  k\xAC~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>  \b \x07k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>  \n 	k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>  \f \vk\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88> Ak! A\xF8I A\bj!\r\0\vA!@ \0 Atj" ( " (\0"j6\0  ($"\x07 ("\bj6  (("	 (\b"\nj6\b  (,"\v (\f"\fj6\f  (0"\r ("j6A\0! A\0 At(\x80\bk\xAC"  k\xAC~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>   \b \x07k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>$  \n 	k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>(  \f \vk\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>,   \rk\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>0  (4" ("j6   k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>4  (8" ("j6   k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>8  (<" ("j6   k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>< Ak! A\xF0I Aj!\r\0\vA!@ \0 Atj" (@" (\0"j6\0  (D"\x07 ("\bj6  (H"	 (\b"\nj6\b  (L"\v (\f"\fj6\f  (P"\r ("j6A\0! A\0 At(\x80\bk\xAC"  k\xAC~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>@  \b \x07k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>D  \n 	k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>H  \f \vk\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>L   \rk\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>P  (T" ("j6   k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>T  (X" ("j6   k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>X  (\\" ("j6   k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>\\  (`" ( "j6    k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>`  (d" ($"j6$   k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>d  (h" (("j6(   k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>h  (l" (,"j6,   k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>l  (p" (0"j60   k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>p  (t" (4"j64   k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>t  (x" (8"j68   k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>x  (|" (<"j6<   k\xAC ~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88>| Ak! A\xE0I A j!\r\0\v@ \0 Atj" (\x80" (\0"j6\0   k\xAC"B\x80\x80\x80\x80\xC0\xBB\x98\x9A\x9E\x7F~B \x87B\xFF\xBF\x80|~ B\xDC\xC3c~|B \x88>\x80 Aj"A G\r\0\vA\xC0\0!@ \0 Atj" (\x80" (\0"j6\0   k\xAC"B\x80\x80\x80\x80\x80\xDB\x97\xF4\x9F\x7F~B \x87B\xFF\xBF\x80|~ B\xD8\xBD5~|B \x88>\x80 Aj"A\xE0\0G\r\0\vA\x80!@ \0 Atj" (\x80" (\0"j6\0   k\xAC"B\x80\x80\x80\x80\x80\xDD\xB7\xF4\xA7\x7F~B \x87B\xFF\xBF\x80|~ B\xE8\xBD/~|B \x88>\x80 Aj"A\xA0G\r\0\vA\xC0!@ \0 Atj" (\x80" (\0"j6\0   k\xAC"B\x80\x80\x80\x80\xC0\xB7\xF8\x99\x9E\x7F~B \x87B\xFF\xBF\x80|~ B\xBC\xC3q~|B \x88>\x80 Aj"A\xE0G\r\0\vA\0!@ \0 Atj" (\x80" (\0"j6\0   k\xAC"B\x80\x80\x80\x80\xD0\xDF\xE2\xF3\xF2\0~B \x87B\xFF\xBF\x80|~ B\xFD\xD5~|B \x88>\x80 Aj"A\xC0\0G\r\0\vA\x80!@ \0 Atj" (\x80" (\0"j6\0   k\xAC"B\x80\x80\x80\x80\xE0\xDF\xE3\x83\xF3\0~B \x87B\xFF\xBF\x80|~ B\xFE\x9D\x9F~|B \x88>\x80 Aj"A\xC0G\r\0\vA\0!@ \0 Atj" (\x80" (\0"j6\0   k\xAC"B\x80\x80\x80\x80\x90\xE1\xAE\xF0\x92\x7F~B \x87B\xFF\xBF\x80|~ B\x89\xB6~~|B \x88>\x80 Aj"A\x80G\r\0\vA\0!@ \0 Atj" 4\0"B\x80\x80\x80\x80\xA0\xFF\xF8\xBF\x7F~B \x87B\xFF\xBF\x80|~ B\xFA\xC7~|B \x88>\0  4"B\x80\x80\x80\x80\xA0\xFF\xF8\xBF\x7F~B \x87B\xFF\xBF\x80|~ B\xFA\xC7~|B \x88> Aj"A\x80G\r\0\v\v\xE1\x7F~@ \0 Atj" (\0" 4\x80"B\x80\x80\x80\x80\xF0\x9E\xD1\x8F\xED\0~B \x87B\xFF\xBF\x80|~ B\xF7\xC9~|B \x88\xA7"k6\x80   j6\0  (" 4\x84"B\x80\x80\x80\x80\xF0\x9E\xD1\x8F\xED\0~B \x87B\xFF\xBF\x80|~ B\xF7\xC9~|B \x88\xA7"k6\x84   j6 Aj"A\x80G\r\0\v@ \0 Atj" (\0" 4\x80"B\x80\x80\x80\x80\xA0\xA0\x9C\xFC\x8C\x7F~B \x87B\xFF\xBF\x80|~ B\x82\xE2\xE0~~|B \x88\xA7"k6\x80   j6\0  (" 4\x84"B\x80\x80\x80\x80\xA0\xA0\x9C\xFC\x8C\x7F~B \x87B\xFF\xBF\x80|~ B\x82\xE2\xE0~~|B \x88\xA7"k6\x84   j6 Aj"A\xC0\0G\r\0\vA\x80!@ \0 Atj" (\0" 4\x80"B\x80\x80\x80\x80\xB0\xA0\x9D\x8C\x8D\x7F~B \x87B\xFF\xBF\x80|~ B\x83\xAA`~|B \x88\xA7"k6\x80   j6\0  (" 4\x84"B\x80\x80\x80\x80\xB0\xA0\x9D\x8C\x8D\x7F~B \x87B\xFF\xBF\x80|~ B\x83\xAA`~|B \x88\xA7"k6\x84   j6 Aj"A\xC0G\r\0\vA\0!@ \0 Atj" (\0" 4\x80"B\x80\x80\x80\x80\xC0\xC8\x87\xE6\xE1\0~B \x87B\xFF\xBF\x80|~ B\xC4\xBC~|B \x88\xA7"k6\x80   j6\0  (" 4\x84"B\x80\x80\x80\x80\xC0\xC8\x87\xE6\xE1\0~B \x87B\xFF\xBF\x80|~ B\xC4\xBC~|B \x88\xA7"k6\x84   j6 Aj"A G\r\0\vA\xC0\0!@ \0 Atj" (\0" 4\x80"B\x80\x80\x80\x80\x80\xA3\xC8\x8B\xD8\0~B \x87B\xFF\xBF\x80|~ B\x98\xC2P~|B \x88\xA7"k6\x80   j6\0  (" 4\x84"B\x80\x80\x80\x80\x80\xA3\xC8\x8B\xD8\0~B \x87B\xFF\xBF\x80|~ B\x98\xC2P~|B \x88\xA7"k6\x84   j6 Aj"A\xE0\0G\r\0\vA\x80!@ \0 Atj" (\0" 4\x80"B\x80\x80\x80\x80\x80\xA5\xE8\x8B\xE0\0~B \x87B\xFF\xBF\x80|~ B\xA8\xC2J~|B \x88\xA7"k6\x80   j6\0  (" 4\x84"B\x80\x80\x80\x80\x80\xA5\xE8\x8B\xE0\0~B \x87B\xFF\xBF\x80|~ B\xA8\xC2J~|B \x88\xA7"k6\x84   j6 Aj"A\xA0G\r\0\vA\xC0!@ \0 Atj" (\0" 4\x80"B\x80\x80\x80\x80\xC0\xC4\xE7\xE5\xE1\0~B \x87B\xFF\xBF\x80|~ B\xA4\xBC~|B \x88\xA7"k6\x80   j6\0  (" 4\x84"B\x80\x80\x80\x80\xC0\xC4\xE7\xE5\xE1\0~B \x87B\xFF\xBF\x80|~ B\xA4\xBC~|B \x88\xA7"k6\x84   j6 Aj"A\xE0G\r\0\vA\b!A\0!@ \0 Atj" (\0" At4\x80\b" 4@~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6@   j6\0  ("  4D~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6D   j6  (\b"  4H~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6H   j6\b  (\f"  4L~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6L   j6\f  ("  4P~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6P   j6  ("  4T~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6T   j6  ("  4X~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6X   j6  ("  4\\~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6\\   j6  ( "  4`~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6`   j6   ($"  4d~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6d   j6$  (("  4h~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6h   j6(  (,"  4l~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6l   j6,  (0"  4p~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6p   j60  (4"  4t~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6t   j64  (8"  4x~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6x   j68  (<"  4|~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88\xA7"k6|   j6< A j!A! Aj"AG\r\0\vA\0!@ \0 Atj" (\0" At4\x80\b" 4 ~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6    j6\0  ("  4$~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6$   j6  (\b"  4(~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6(   j6\b  (\f"  4,~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6,   j6\f  ("  40~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k60   j6  ("  44~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k64   j6  ("  48~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k68   j6  ("  4<~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88\xA7"k6<   j6 Aj!A ! Aj"A G\r\0\vA\0!@ \0 Atj" (\0" At4\x80\b" 4~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6   j6\0  ("  4~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6   j6  (\b"  4~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6   j6\b  (\f"  4~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88\xA7"k6   j6\f A\bj!A\xC0\0! Aj"A\xC0\0G\r\0\vA\0!@ \0 Atj" (\0" At4\x80\b" 4\b~"\x07B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \x07|B \x88\xA7"k6\b   j6\0  ("  4\f~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88\xA7"k6\f   j6 Aj!A\x80! Aj"A\x80G\r\0\vA\0!@ \0 Atj" (\0" 4 At4\x80\b~"B\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ |B \x88\xA7"k6   j6\0 Aj! Aj"A\x80G\r\0\v\vX\x7F@ \0 Atj" (\0"A\x80\x80\x80jAuA\xFF\xBF\x80|l j6\0  ("A\x80\x80\x80jAuA\xFF\xBF\x80|l j6 Aj"A\x80G\r\0\v\vH\x7F@ \0 Atj(\0"\xACB\x88\xA7!     A\0 ksqsA\x7Fsj\xACB\x88\xA7r! Aj"A\x80G\r\0\v \v\x88\x7F@ \0 At"j"  j(\0 (\0j6\0 \0 Ar"j"  j(\0 (\0j6\0 \0 A\br"j"  j(\0 (\0j6\0 \0 A\fr"j"  j(\0 (\0j6\0 Aj"A\x80G\r\0\v\vc\x7F@ \0 jA\xC0\0  Atj"(AtkA (\0kr:\0\0 \0 Ar"jA\xC0\0  Atj"(AtkA (\0kr:\0\0 Aj"A\x80G\r\0\v\vN\x7F@ \0 Atj"  j"-\0\0Aq"6\0 -\0\0! A k6\0 A Avk6 Aj"A\x80G\r\0\v\va\x7F (\xC8! @@ A\x88F@ A\0!\v  \0 j  A\x88 k"  I\x1B""  j!  j!  k"\r\0\v\v  6\xC8\vO\x7F#\0Ak"$\0 \0(\xC8! A:\0 A\x80:\0 \0 Aj A \0 AjA\x87A \0A\x886\xC8 Aj$\0\v\x88\x7F@ \0 At"j" (\0  j(\0k6\0 \0 Ar"j" (\0  j(\0k6\0 \0 A\br"j" (\0  j(\0k6\0 \0 A\fr"j" (\0  j(\0k6\0 Aj"A\x80G\r\0\v\v\x9A\x7F@A\x80\xE0\xFF  At"j(\0"A\xFF\0jA\x07uA\x81\blA\x80\x80\x80jAv"\x07Aq"A\x80\x84`l j"k\xACB\x88\xA7!\b@  j(\0E\r\0 A\x81\xC0\xFFk s \bq sA\0J@ \x07AjAq!\f\v \x07AkAq!\v \0 j 6\0 Aj"A\x80G\r\0\v\vT\x7F@ \0 At"j  j(\0"A\x81\xFEkA\xFF\x83`I A\x80\x82pF  j(\0A\0Gqr"6\0  j! Aj"A\x80G\r\0\v \vx\x7F@ \0 At"j  j"(\0"A\xFF\0jA\x07uA\x81\blA\x80\x80\x80jAvAq"6\0   A\x80\x84`lj"6\0 A\x80\xE0\xFF k\xACB\x88\xA7 A\x81\xC0\xFFk sq s6\0 Aj"A\x80G\r\0\v\v\xDF\v\x7F@ \0 \bAtj"  \bA\rlj"-\0\0"	6\0  	 -\0A\btA\x80>qr"	6\0  -\0Av"6  -\0At r"6  -\0A\vtA\x800q r"6  -\0Av"\n6\b  -\0AtA\xC0?q \nr"\n6\b  -\0A\x07v"6\f  -\0At r"6\f  -\0A	tA\x80<q r"6\f  -\0Av"6  -\0\x07At r"6  -\0\bA\ftA\x80 q r"6  -\0\bAv"\v6  -\0	A\x07tA\x80?q \vr"\v6  -\0	Av"\x076  -\0\nAt \x07r"\x076  -\0\vA\ntA\x808q \x07r"\x076  -\0\vAv"\f6 -\0\f! A\x80  \x07k6 A\x80  \vk6 A\x80  k6 A\x80  k6\f A\x80  \nk6\b A\x80  k6 A\x80  	k6\0 A\x80  At \frk6 \bAj"\bA G\r\0\v\v\xB0\v\x7F@  Atj"(\b!	 (!\n (! (\f! (!\x07 (!\v (!\b \0 A\rlj"A\x80  (\0k"\f:\0\0 A\x80  \bk"\bAv:\0\f A\x80  \vk"Av:\0\n A\x80  \x07k"\x07Av:\0\x07 A\x80  k"Av:\0 A\x80  k"Av:\0  \bAt A\nvr:\0\v  AtA\x80  \nk"A\x07vr:\0	  At \x07A\fvr:\0\b  \x07At A	vr:\0  A\x07tA\x80  	k"Avr:\0  At A\vvr:\0  At \fA\bvr:\0 Aj"A G\r\0\v\v\x85\x7F@ \0 Atj"  Alj"-\0A\btA\x80q -\0\0r6\0  -\0AtA\xC0\x07q -\0Avr6  -\0AtA\xF0\x07q -\0Avr6\b  -\0At -\0Avr6\f Aj"A\xC0\0G\r\0\v\v}\x7F@ \0 Alj"  Atj"(\0:\0\0  (At (\0A\bvr:\0  (\bAt (Avr:\0  (\fAt (\bAvr:\0  (\fAv:\0 Aj"A\xC0\0G\r\0\v\vv\x7F@ \0 At"j  j(\0"A\xFFj"A\ru6\0  j  A\x80@qk6\0 \0 Ar"j  j(\0"A\xFFj"A\ru6\0  j  A\x80@qk6\0 Aj"A\x80G\r\0\v\vP\x7F@ \0 Atj" (\0A\rt6\0  (A\rt6  (\bA\rt6\b  (\fA\rt6\f Aj"A\x80G\r\0\v\vd\x7F@ \0 Atj"(\0"\xACB\x88\xA7!     A\x81\xC0\xFFjsqs6\0 ("\xACB\x88\xA7!     A\x81\xC0\xFFjsqs6 Aj"A\x80G\r\0\v\vU\x7F@ \0 j  Atj"(At (\0r:\0\0 \0 Ar"j  Atj"(At (\0r:\0\0 Aj"A\x80G\r\0\v\v\x81\x7F \0A\xB0j!A\0!\0@@  \0Atj(\0E\r\0 A6K\r\0  j \0:\0\0 Aj!\v@  \0Ar"Atj(\0E\r\0 A6K\r\0  j :\0\0 Aj!\v \0Aj"\0A\x80G\r\0\v  j :\x007\v\x9F\x7F@ \0 Atj"  Alj"-\0\0"6\0   -\0A\btr"6\0  -\0AtA\x80\x80<q r"6\0  -\0Av"6  -\0At r"6 -\0! A\x80\x80  k6\0 A\x80\x80  A\ft rk6 Aj"A\x80G\r\0\v\v\x83\x7F \0 A\x80ljA0j!A\0!\0@  \0Atj"(!  \0Alj"A\x80\x80  (\0k":\0\0 A\x80\x80  k"A\fv:\0  Av:\0  A\bv:\0  At Avr:\0 \0Aj"\0A\x80G\r\0\v\v\x94\x07\x7F@ E\r\0 \0 j!\0 Aq!\fA\0!@ AO@ A|q!\n@ \0 j"\x07 \x07-\0\0  j-\0\0s:\0\0 \0 Ar"\x07j"\v \v-\0\0  \x07j-\0\0s:\0\0 \0 Ar"\x07j"\v \v-\0\0  \x07j-\0\0s:\0\0 \0 Ar"\x07j"\v \v-\0\0  \x07j-\0\0s:\0\0 Aj! 	Aj"	 \nG\r\0\v \fE\r\v@ \0 j"	 	-\0\0  j-\0\0s:\0\0 Aj! \bAj"\b \fG\r\0\v\v Aq!\f \0A\xC8j!A\0!\bA\0!@ AO@ A|q!\nA\0!	@  j"\x07 \x07-\0\0  j-\0\0s:\0\0  Ar"\x07j"\v \v-\0\0  \x07j-\0\0s:\0\0  Ar"\x07j"\v \v-\0\0  \x07j-\0\0s:\0\0  Ar"\x07j"\v \v-\0\0  \x07j-\0\0s:\0\0 Aj! 	Aj"	 \nG\r\0\v \fE\r\v@  j"	 	-\0\0  j-\0\0s:\0\0 Aj! \bAj"\b \fG\r\0\v\v Aq!	 \0A\x90j!A\0!A\0!@ AO@ A|q!\fA\0!\b@  j"\n \n-\0\0  j-\0\0s:\0\0  Ar"\nj"\x07 \x07-\0\0  \nj-\0\0s:\0\0  Ar"\nj"\x07 \x07-\0\0  \nj-\0\0s:\0\0  Ar"\nj"\x07 \x07-\0\0  \nj-\0\0s:\0\0 Aj! \bAj"\b \fG\r\0\v 	E\r\v@  j"\b \b-\0\0  j-\0\0s:\0\0 Aj! Aj" 	G\r\0\v\v Aq! \0A\xD8j!\0A\0!A\0! AO@ A|q!A\0!@ \0 j"\b \b-\0\0  j-\0\0s:\0\0 \0 Ar"\bj"	 	-\0\0  \bj-\0\0s:\0\0 \0 Ar"\bj"	 	-\0\0  \bj-\0\0s:\0\0 \0 Ar"\bj"	 	-\0\0  \bj-\0\0s:\0\0 Aj! Aj" G\r\0\v E\r\v@ \0 j" -\0\0  j-\0\0s:\0\0 Aj! Aj" G\r\0\v\v\v&\0 \0 \0A\x80\bj \0A\x80j \0A\x80j \0A\x80 j\v\xB7\r\n\x7F#\0"	 	A\xA0kA`q"	$\0 	 )\x0087\xD8 	 )\x0007\xD0 	 )\0(7\xC8 	 )\0 7\xC0 	 )\07\xB8 	 )\07\xB0 	 )\0\b7\xA8 	 )\0\x007\xA0 	 )\0\x007\x80\x07 	 )\0\b7\x88\x07 	 )\07\x90\x07 	 )\07\x98\x07 	 )\0 7\xA0\x07 	 )\0(7\xA8\x07 	 )\x0007\xB0\x07 	 )\x0087\xB8\x07 	 )\0\x007\xE0\x07 	 )\0\b7\xE8\x07 	 )\07\xF0\x07 	 )\07\xF8\x07 	 )\0 7\x80\b 	 )\0(7\x88\b 	 )\x0007\x90\b 	 )\x0087\x98\b 	 )\0\x007\xC0\b 	 )\0\b7\xC8\b 	 )\07\xD0\b 	 )\07\xD8\b 	 )\0 7\xE0\b 	 )\0(7\xE8\b 	 )\x0087\xF8\b 	 )\x0007\xF0\b 	 \b:\0\x80	 	 \x07:\0\xA0\b 	 :\0\xC0\x07 	 :\0\xE0A\0!\b 	A\0:\0\x81	 	A\0:\0\xA1\b 	A\0:\0\xC1\x07 	A\0:\0\xE1 	 	A\xA0j 	A\x80\x07j 	A\xE0\x07j 	A\xC0\bj, 	A\xA0	j 	A\xC0\vj" 	A\xE0\rj" 	A\x80j"A 	#A\0!@ 	A\xA0	j \bj-\0\0"Aq"A\bM@ \0 AtjA k6\0 Aj!\v@ A\x8FK\r\0 A\xFFK\r\0 \0 AtjA Avk6\0 Aj!\v A\x80I!\fA\0!@ A\xFFK@A\0!\x07\f\v \bA\x8FI \bAj!\bA\0!\x07\r\v\v@ \x07 j-\0\0"Aq"\bA\bM@  AtjA \bk6\0 Aj!\v@ A\x8FK\r\0 A\xFFK\r\0  AtjA Avk6\0 Aj!\v A\x80I!\vA\0!\b@ A\xFFK@A\0!\f\v \x07A\x8FI \x07Aj!\x07A\0!\r\v\v@  j-\0\0"\x07Aq"\nA\bM@  \bAtjA \nk6\0 \bAj!\b\v@ \x07A\x8FK\r\0 \bA\xFFK\r\0  \bAtjA \x07Avk6\0 \bAj!\b\v \bA\x80I!A\0!\x07@ \bA\xFFK@A\0!\n\f\v A\x8FI Aj!A\0!\n\r\v\v@ \n j-\0\0"Aq"\rA\bM@  \x07AtjA \rk6\0 \x07Aj!\x07\v@ A\x8FK\r\0 \x07A\xFFK\r\0  \x07AtjA Avk6\0 \x07Aj!\x07\v \x07A\xFFM@ \nA\x8FI \nAj!\n\r\v\v \x07A\x80I!\n@@ A\x80I\r\0 A\x80I\r\0 \bA\x80I\r\0 \x07A\xFFK\r\v@ 	A\xA0	j   A 	#A\0!@ \fE\r\0@ 	A\xA0	j j-\0\0"\fAq"\rA\bM@ \0 AtjA \rk6\0 Aj!\v@ \fA\x8FK\r\0 A\xFFK\r\0 \0 AtjA \fAvk6\0 Aj!\v A\xFFK\r A\x87I Aj!\r\0\v\vA\0!@ \vE\r\0@  j-\0\0"\vAq"\fA\bM@  AtjA \fk6\0 Aj!\v@ \vA\x8FK\r\0 A\xFFK\r\0  AtjA \vAvk6\0 Aj!\v A\xFFK\r A\x87I Aj!\r\0\v\vA\0!@ E\r\0@  j-\0\0"\vAq"\fA\bM@  \bAtjA \fk6\0 \bAj!\b\v@ \vA\x8FK\r\0 \bA\xFFK\r\0  \bAtjA \vAvk6\0 \bAj!\b\v \bA\xFFK\r A\x87I Aj!\r\0\v\vA\0!@ \nE\r\0@  j-\0\0"\nAq"\vA\bM@  \x07AtjA \vk6\0 \x07Aj!\x07\v@ \nA\x8FK\r\0 \x07A\xFFK\r\0  \x07AtjA \nAvk6\0 \x07Aj!\x07\v \x07A\xFFK\r A\x87I Aj!\r\0\v\v \x07A\x80I"!\n \bA\x80I! A\x80I!\v A\x80I"\f\r\0 \v\r\0 \r\0 \r\0\v\v 	A\0A\xA0\xFC\v\0 	A\xA0	jA\0A\x80	\xFC\v\0 	A\xA0jA\0A\x80\xFC\v\0$\0\v\x91\x7F \0Aj"A\x07jAxq" j \0 \0(\0"jAkM\x7F \0(" \0(\b"6\b  6  G@ \0 \0Ak(\0A~qk"  k" (\0j"6\0  A|qjAk 6\0 \0 j"\0  k"6\0\v\x7F  AjO@ \0 j"  kA\bk"6\b A\bj" A|qjAk Ar6\0 \x7F (\bA\bk"A\xFF\0M@ AvAk\f\v A g"kvAs AtkA\xEE\0j A\xFFM\r\0A? A kvAs AtkA\xC7\0j" A?O\x1B\v"At"A\xE0j6\f  A\xE8j"(\x006  6\0 ( 6A\xE8\x1BA\xE8\x1B)\0B \xAD\x86\x847\0 \0 A\bj"6\0 \0 A|qj\f\v \0 j\vAk 6\0 \0AjA\0\v\v\0 \0 \0A\xC8j \0A\x90j \0A\xD8j\v\xC1\x7F@ E\r\0 \0 j!\0 Aq!A\0! AO@ A|q!\x07A\0!@  j \0 j-\0\0:\0\0  Ar"j \0 j-\0\0:\0\0  Ar"j \0 j-\0\0:\0\0  Ar"j \0 j-\0\0:\0\0 Aj! Aj" \x07G\r\0\v E\r\v@  j \0 j-\0\0:\0\0 Aj! Aj" G\r\0\v\v\v<\x7F @@ !  \0 j  j  j  jA\x88+ A\x88j! Ak"\r\0\v\v\v.\0 \0 \0A\x80\bj \0A\x80j \0A\x80j \0A\x80 j \0A\x80(j\v.\0 \0 \0A\x80\bj \0A\x80j \0A\x80j \0A\x80 j \0A\x80(j\v.\0 \0 \0A\x80\bj \0A\x80j \0A\x80j \0A\x80 j \0A\x80(j\v\x92\x07\x7F~@ \0 At"j  j"4\x80\b  j"4\x80\b~ 4\0 4\0~| 4\x80 4\x80~| 4\x80 4\x80~| 4\x80  4\x80 ~|"\bB\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \b|B \x88>\0 Aj"A\x80G\r\0\v \0A\x80\bj! A\x80(j!\x07A\0!@  At"j  j"4\x80\b  \x07j"4\x80\b~ 4\0 4\0~| 4\x80 4\x80~| 4\x80 4\x80~| 4\x80  4\x80 ~|"\bB\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \b|B \x88>\0 Aj"A\x80G\r\0\v \0A\x80j! A\x80\xD0\0j!\x07A\0!@  At"j  j"4\x80\b  \x07j"4\x80\b~ 4\0 4\0~| 4\x80 4\x80~| 4\x80 4\x80~| 4\x80  4\x80 ~|"\bB\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \b|B \x88>\0 Aj"A\x80G\r\0\v \0A\x80j! A\x80\xF8\0j!\x07A\0!@  At"j  j"4\x80\b  \x07j"4\x80\b~ 4\0 4\0~| 4\x80 4\x80~| 4\x80 4\x80~| 4\x80  4\x80 ~|"\bB\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \b|B \x88>\0 Aj"A\x80G\r\0\v \0A\x80 j! A\x80\xA0j!\x07A\0!@  At"j  j"4\x80\b  \x07j"4\x80\b~ 4\0 4\0~| 4\x80 4\x80~| 4\x80 4\x80~| 4\x80  4\x80 ~|"\bB\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \b|B \x88>\0 Aj"A\x80G\r\0\v \0A\x80(j! A\x80\xC8j!A\0!@  At"j  j"\x004\x80\b  j"4\x80\b~ \x004\0 4\0~| \x004\x80 4\x80~| \x004\x80 4\x80~| \x004\x80  4\x80 ~|"\bB\x80\x80\x80\x80\x90\x80\x88\xC0~B \x87B\xFF\xBF\x80|~ \b|B \x88>\0 Aj"A\x80G\r\0\v\v\x84\f\x7F#\0" A\x80kA`q"$\0  )\07  )\07  )\0\b7\b  )\0\x007\0  )\07X  )\07P  )\0\b7H  )\0\x007@  )\0\x007\x80  )\0\b7\x88  )\07\x90  )\07\x98  )\0\x007\xC0  )\0\b7\xC8  )\07\xD0  )\07\xD8A\0!@  A\xFFq"Ap":\0   An":\0!  ArA\xFFq"Ap":\0\xE0  An":\0\xE1  ArA\xFFq"	Ap"\v:\0\xA0  	An"	:\0\xA1  ArA\xFFq"\x07Ap"\b:\0`  \x07An"\x07:\0a \0 A\x80(lj A\ntj! \0 \x07A\x80(lj \bA\ntj! \0 	A\x80(lj \vA\ntj! \0 A\x80(lj A\ntj!A\0!A\0!\bA\0!\nA\0!\v#\0" A\xA0!kA`q"\x07$\0 \x07A\0A\xA0\xFC\v\0 \x07A\xA8  A@k A\x80j A\xC0jA". \x07A\xA0j \x07A\x80\rj"\f \x07A\xE0j"\r \x07A\xC0j"A \x07-A!@A! \x07A\xA0j j"/\0\0 -\0AtA\x80\x80\xFCqr"A\x80\xC0\xFFM@  \nAtj 6\0 \nAj!\n\v \nA\x80I"	!A\0! "A\xC5M@ Aj! 	\r\v\v@A!  \fj"/\0\0 -\0AtA\x80\x80\xFCqr"A\x80\xC0\xFFM@  \bAtj 6\0 \bAj!\b\v \bA\x80I!A\0!	@ "A\xC5K@A\0!\f\v Aj!A\0! \bA\x80I\r\v\v@ 	 \rj"/\0\0 -\0AtA\x80\x80\xFCqr"A\x80\xC0\xFFM@  Atj 6\0 Aj!\vA! A\x80I!@ "	A\xC5K@A\0!\f\v 	Aj!A\0! A\x80I\r\v\v@ \v j"/\0\0 -\0AtA\x80\x80\xFCqr"A\x80\xC0\xFFM@  Atj 6\0 Aj!\v "A\xC5M@ Aj! !\v A\x80I\r\v\v A\x80I!	@@ \nA\x80I\r\0 \bA\x80I\r\0 A\x80I\r\0 A\xFFK\r\v@ \x07A\xA0j \f \r A \x07-@ E\r\0A\0!A!@ \x07A\xA0j j"/\0\0 -\0AtA\x80\x80\xFCqr"A\x80\xC0\xFFM@  \nAtj 6\0 \nAj!\n\v "A\xA5K\r Aj! \nA\x80I\r\0\v\v@ E\r\0A\0!A!@  \fj"/\0\0 -\0AtA\x80\x80\xFCqr"A\x80\xC0\xFFM@  \bAtj 6\0 \bAj!\b\v "A\xA5K\r Aj! \bA\x80I\r\0\v\v@ E\r\0A\0!A!@  \rj"/\0\0 -\0AtA\x80\x80\xFCqr"A\x80\xC0\xFFM@  Atj 6\0 Aj!\v "A\xA5K\r Aj! A\x80I\r\0\v\v@ 	AqE\r\0A\0!A!@  j"/\0\0 -\0AtA\x80\x80\xFCqr"A\x80\xC0\xFFM@  Atj 6\0 Aj!\v "A\xA5K\r Aj! A\x80I\r\0\v\v A\x80I"!	 A\x80I"! \bA\x80I"\v! \nA\x80I"\r\0 \v\r\0 \r\0 \r\0\v\v \x07A\0A\xA0\xFC\v\0 \x07A\xA0jA\0A\x80\x1B\xFC\v\0$\0 AI Aj!\r\0\v A\x83\n;  \0A\x80\xE0j 4 A\x84\n;  \0A\x80\xE8j 4 A\0A\x80\xFC\v\0$\0\v\xF5\x7F~#\0" A\x80kA`q"$\0 Aj"A\0A\xCC\xFC\v\0  A0 \r A\xE0jA\x88 \f )\xE0!\x07 \0A\0A\x80\b\xFC\v\0A\b!A\xCF!@ A\x88O\x7F A\xE0jA\x88 Aj\fA\0 \v"Aj!   A\xE0j"j-\0\0"I\r\0 \0 Atj \0 Atj"(\x006\0 A \x07\xA7AtAqk6\0 \x07B\x88!\x07 Aj"A\x80G\r\0\v AjA\0A\xD0\xFC\v\0 A\0A\x88\xFC\v\0 B\x007\xF8$\0\v\xA6\x07\x7F~\x7F@ \0A\x07jAxq"\xAD!\bA~ \bB\x07|B\xF8\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\0\x83B\0B\0 \b}B\xF8\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\0\x83}\vA\xB0(\0"\xAD|"\bB\xFF\xFF\xFF\xFFX@ \b\xA7"\0?\0AtM\r \0\0\r\vA\xD0A06\0A\x7F\f\vA\xB0 \x006\0 \v"A\x7FG@  j"\0AkA6\0 \0Ak"A6\0@\x7FA\xE0\x1B(\0"\x7F (\bA\0\v F@  Ak(\0A~q"k"Ak(\0!\x07  \x006\b  \x07A~q"k"\0 \0(\0jAk-\0\0Aq@ \0(" \0(\b"6\b  6 \0  j jAk"6\0\f\v Ak\f\v A6\0  \x006\b  6 A6\fA\xE0\x1B 6\0 Aj\v"\0  \0k"6\0\v \0 A|qjAk Ar6\0 \0\x7F \0(\0A\bk"A\xFF\0M@ AvAk\f\v A g"kvAs AtkA\xEE\0j A\xFFM\r\0A? A kvAs AtkA\xC7\0j" A?O\x1B\v"At"A\xE0j6 \0 A\xE8j"(\x006\b  \x006\0 \0(\b \x006A\xE8\x1BA\xE8\x1B)\0B \xAD\x86\x847\0\v A\x7FG\v\xE9\x7F@ E\r\0 Aq!\n@ AO@ A|q!	@  j \0 j-\0\0:\0\0  Ar"\bj \0 \bj-\0\0:\0\0  Ar"\bj \0 \bj-\0\0:\0\0  Ar"\bj \0 \bj-\0\0:\0\0 Aj! \vAj"\v 	G\r\0\v \nE\r\v@  j \0 j-\0\0:\0\0 Aj! \x07Aj"\x07 \nG\r\0\v\v Aq!\n \0A\xC8j!A\0!\x07A\0!@ AO@ A|q!	A\0!\v@  j  j-\0\0:\0\0  Ar"\bj  \bj-\0\0:\0\0  Ar"\bj  \bj-\0\0:\0\0  Ar"\bj  \bj-\0\0:\0\0 Aj! \vAj"\v 	G\r\0\v \nE\r\v@  j  j-\0\0:\0\0 Aj! \x07Aj"\x07 \nG\r\0\v\v Aq!\v \0A\x90j!A\0!A\0!@ AO@ A|q!\nA\0!\x07@  j  j-\0\0:\0\0  Ar"	j  	j-\0\0:\0\0  Ar"	j  	j-\0\0:\0\0  Ar"	j  	j-\0\0:\0\0 Aj! \x07Aj"\x07 \nG\r\0\v \vE\r\v@  j  j-\0\0:\0\0 Aj! Aj" \vG\r\0\v\v Aq! \0A\xD8j!\0A\0!A\0! AO@ A|q!A\0!@  j \0 j-\0\0:\0\0  Ar"\x07j \0 \x07j-\0\0:\0\0  Ar"\x07j \0 \x07j-\0\0:\0\0  Ar"\x07j \0 \x07j-\0\0:\0\0 Aj! Aj" G\r\0\v E\r\v@  j \0 j-\0\0:\0\0 Aj! Aj" G\r\0\v\v\v\0 \0A\0A\xA0\xFC\v\0 \0A\x88    A\xC2\0.\v<\x7F @@ !  \0 j  j  j  jA\xA8+ A\xA8j! Ak"\r\0\v\v\v\xC8\x7F#\0Ak"\x07$\0 \x07A:\0  M@@ \0    A\0  \0!  j!  j!  j!  j!  k" O\r\0\v\v @ \0    A\0 \vA\x9F!@ Ak" F@ !\f\v \0 \x07Aj"    AA\x80!\v \x07 :\0 \0 \x07Aj"\0 \0 \0 \0 A \x07Aj$\0\v\xB5\x7F#\0A\xE0k"$\0 A\bj"A\0A\xCC\xFC\v\0A\x88!@ A\x88I\r\0  A\0A\x88 A\x88j!  A\x88k"A\x88I\r\0@ A\bj" A\0A\x88 A\x88j!  A\x88k"A\x87K\r\0\v\v A\bj" A\0   6\xD0 A:\0\xDF A\x80:\0\xDE  A\xDFj A  A\xDEjA\x87A A\x886\xD0 @@ A\x88F@ A\bjA\0!\v A\bj \0 \x07j  A\x88 k"  I\x1B""  \x07j!\x07  j!  k"\r\0\v\v A\bjA\0A\xD0\xFC\v\0 A\xE0j$\0\va\x7F (\xC8! @@ A\xA8F@ A\0!\v  \0 j  A\xA8 k"  I\x1B""  j!  j!  k"\r\0\v\v  6\xC8\vd\x7F#\0A\xD0k"$\0 A\0A\xCC\xFC\v\0  A\xC0\0 @   \v @   \v \r \0A\xC0\0 \f A\0A\xD0\xFC\v\0 A\0A\xD0\xFC\v\0 A\xD0j$\0\vN\0 \0  \0A\x80j A\x80\bj \0A\x80j A\x80j \0A\x80j A\x80j \0A\x80j A\x80 j \0A\x80j A\x80(j\v.\0 \0\x07 \0A\x80\bj\x07 \0A\x80j\x07 \0A\x80j\x07 \0A\x80 j\x07 \0A\x80(j\x07\v\x80\x7F#\0" A\xC0\bkA`q"$\0 Aj"A\0A\xCC\xFC\v\0A"!@A\xA8 (\xC8"k"A"K\r\0       j!A\0!A" k"A\xA8I\r\0@  A\0A\xA8  A\xA8j! A\xA8k"A\xA7K\r\0\v\v       j6\xC8#\0Ak"$\0 (\xC8! A:\0 A\x80:\0  Aj A  AjA\xA7A A\xA86\xC8 Aj$\0 A\xE0jA\xC8 0A\0!A!A\0!@ A\xE0j j"/\0\0 -\0AtA\x80\x80\xFCqr"A\x80\xC0\xFFM@ \0 Atj 6\0 Aj!\v "A\xC5M@ Aj! A\x80I\r\v\v A\x80I@@ A\xE0jA\xA8 Aj0A\0!A!@ A\xE0j j"/\0\0 -\0AtA\x80\x80\xFCqr"A\x80\xC0\xFFM@ \0 Atj 6\0 Aj!\v "A\xA5M@ Aj! A\x80I\r\v\v A\xFFM\r\0\v\v AjA\0A\xD0\xFC\v\0 A\xE0jA\0A\xC8\xFC\v\0$\0\v\xCC\x7F \0@ \0Ak"(\0"! ! \0A\bk(\0"\0 \0A~q"\0G@  \0k"(" (\b"6\b  6 \0 j!\v  j"\0(\0" \0 jAk(\0G@ \0(" \0(\b"\x006\b \0 6  j!\v  6\0  A|qjAk Ar6\0 \x7F (\0A\bk"\0A\xFF\0M@ \0AvAk\f\v \0g! \0A kvAs AtkA\xEE\0j \0A\xFFM\r\0A? \0A kvAs AtkA\xC7\0j"\0 \0A?O\x1B\v"At"\0A\xE0j6  \0A\xE8j"\0(\x006\b \0 6\0 (\b 6A\xE8\x1BA\xE8\x1B)\0B \xAD\x86\x847\0\v\v\xE2\x7F~@@@ \0AGK\rA\xE8\x1B)\0"\x7FA\b \0AjA|q \0A\bM\x1B"\0A\xFF\0M@ \0AvAk\f\v \0A \0g"kvAs AtkA\xEE\0j \0A\xFFM\r\0A? \0A kvAs AtkA\xC7\0j" A?O\x1B\v"\xAD\x88"\x07B\0R@@ \x07 \x07z"\x07\x88!~  \x07\xA7j"At"A\xE8j(\0" A\xE0j"G@  \0 "\r (" (\b"6\b  6  6\b  (6  6 ( 6\b Aj! B\x88\f\vA\xE8\x1BA\xE8\x1B)\0B~ \xAD\x89\x837\0 B\x85\v"\x07B\0R\r\0\vA\xE8\x1B)\0!\vA? y\xA7k!@ P@A\0!\f\v At"A\xE8j(\0! B\x80\x80\x80\x80T\r\0A\xE3\0!  A\xE0j"F\r\0@ E\r  \0 "\r Ak! (\b" G\r\0\v\v \0A0j*\r\0\v E\r\0  AtA\xE0j"F\r\0@  \0 "\r (\b" G\r\0\v\vA\0!\v \v\0#\0\v\0#\0 \0kApq"\0$\0 \0\v\0 \0$\0\v\xA9\x7F#\0" A\xE0kA`q"$\0A\x7F!\x07 A\xFFM@  :\0 A\0:\0\0@ E"\x07\r\0 \x07\r\0 Ar  \xFC\n\0\0\v Aj!#\0" A\xC0\xE9kA`q"$\0A\x7F!\v@ A\xEDG\r\0 A\xC0\xE1j"" )\07\0  )\07\0  )\0\b7\0\b  )\0\x007\0\0 A\x80\xE0\0j" A j A\x80\bj A\xE0j A\x80j A\xA0j A\x80j A\xE0\x07j A\x80 j A\xA0\nj A\x80(j A\xE0\fj A\xC0\xE0j"" \0)\0(7\0(  \0)\0 7\0   \0)\07\0  \0)\07\0  \0)\0\b7\0\b  \0)\0\x007\0\0 A\x80\xC0j"\f" \0A0j"\x07\x1B A\x80\bj \x07A\x80j\x1B A\x80j \x07A\x80\nj\x1B A\x80j \x07A\x80j\x1B A\x80 j \x07A\x80j\x1B A\0A\x800\xFC\v\0A!\r@ \0-\0\xE7"\bA7K\r\0 \0A\xB0j!\x07@@ \bE\r\0A!  \x07-\0\0AtjA6\0 \bAF\r\0@  \x07j"	-\0\0"\n 	Ak-\0\0M\r  \nAtjA6\0 Aj" \bG\r\0\v\v \0-\0\xE8"	A7K\r \b 	K\r@ \b 	O\r\0 A\x80\bj" \x07 \bj-\0\0AtjA6\0 \bAj" 	F\r\0@  \x07j"-\0\0!\n  \bK@ \n Ak-\0\0M\r\v  \nAtjA6\0 Aj" 	G\r\0\v\v \0-\0\xE9"\bA7K\r \b 	I\r@ \b 	M\r\0 A\x80j" \x07 	j-\0\0AtjA6\0 	Aj" \bF\r\0@  \x07j"-\0\0!\n  	K@ \n Ak-\0\0M\r\v  \nAtjA6\0 Aj" \bG\r\0\v\v \0-\0\xEA"	A7K\r \b 	K\r@ \b 	O\r\0 A\x80j" \x07 \bj-\0\0AtjA6\0 \bAj" 	F\r\0@  \x07j"-\0\0!\n  \bK@ \n Ak-\0\0M\r\v  \nAtjA6\0 Aj" 	G\r\0\v\v \0-\0\xEB"\bA7K\r \b 	I\r@ \b 	M\r\0 A\x80 j" \x07 	j-\0\0AtjA6\0 	Aj" \bF\r\0@  \x07j"-\0\0!\n  	K@ \n Ak-\0\0M\r\v  \nAtjA6\0 Aj" \bG\r\0\v\v \0-\0\xEC"\0A7K\r \0 \bI\r@ \0 \bM\r\0 A\x80(j"\r \x07 \bj-\0\0AtjA6\0 \bAj" \0F\r\0@  \x07j"\n-\0\0!	  \bK@ 	 \nAk-\0\0M\r\v \r 	AtjA6\0 Aj" \0G\r\0\v\vA\0!\r \0A7O\r@ \0 \x07j-\0\0\r \0Aj"\0A7G\r\0\v\f\vA!\r\v \r\r\0 \fA\xBC\xFE\b!\0 \fA\x80\bjA\xBC\xFE\b! \fA\x80jA\xBC\xFE\b!\x07 \fA\x80jA\xBC\xFE\b!	 \fA\x80 jA\xBC\xFE\b 	 \x07 \0 rrrr\r\0 A\x80\xE8j"\x07A\0A\xCC\xFC\v\0 \x07 A\xA0 \x07\r A\x800j"\0A\xC0\0 \x07\f \x07A\0A\xD0\xFC\v\0 \x07A\0A\xD0\xFC\v\0 A\x80\xE1j"	 \0    1 B\x007\xB80 B\x007\xB00 B\x007\xA80 B\x007\xA00 B\x007\x980 B\x007\x900 B\x007\x880 B\x007\x800 A\x80\xD8j" )   A\x80\bj" A\x80j" A\x80j"\v A\x80 j"\b A\x80(j"\r % \0   \0A\x80\bj"   \0A\x80j"   \0A\x80j"  \v \0A\x80 j"  \b \0A\x80(j"\v  \r \x07 ( \f A\x80\x90j" \x07 \f\'  \0 A\x80\bj"\x07  A\x80j"\b  A\x80j"\f  A\x80 j"\r  A\x80(j"\n \v 3 $ & \0    \x07 A\x80\bj  \b A\x80j  \f A\x80j  \r A\x80 j \v \n A\x80(j A\xE0\xE1j" \02 A\xF0\xE7j"\0A\0A\xCC\xFC\v\0 \0 	A\xC0\0 \0 A\x80 \0\r A\x80\xE0jA0 \0\f \0A\0A\xD0\xFC\v\0A\0! \0A\0A\xD0\xFC\v\0A\0!\vA\0!\0@ \vAj" A\x80\xE0j"j-\0\0  A\xC0\xE0j"j-\0\0s"  \vAj"j-\0\0  j-\0\0s"  \vj-\0\0  \vj-\0\0s" sss!   \0 rrr!\0 \vAj"\vA0G\r\0\vA\x7FA\0 B\0 \0\xADB\xFF\x83}B \x88\xA7sA\xFFq A\xFFqG\x1B!\v\v A\0A\x800\xFC\v\0 A\x800jA\0A\x800\xFC\v\0 A\x80\xE0\0jA\0A\x80\xE0\0\xFC\v\0 A\x80\xC0jA\0A\x80(\xFC\v\0 A\x80\xE8jA\0A\x80\xF0\xFC\v\0 A\x80\xD8jA\0A\x80\b\xFC\v\0 B\x007\xA8\xE0 B\x007\xA0\xE0 B\x007\x98\xE0 B\x007\x90\xE0 B\x007\x88\xE0 B\x007\x80\xE0 B\x007\xE8\xE0 B\x007\xE0\xE0 B\x007\xD8\xE0 B\x007\xD0\xE0 B\x007\xC8\xE0 B\x007\xC0\xE0 B\x007\xB8\xE1 B\x007\xB0\xE1 B\x007\xA8\xE1 B\x007\xA0\xE1 B\x007\x98\xE1 B\x007\x90\xE1 B\x007\x88\xE1 B\x007\x80\xE1 B\x007\xD8\xE1 B\x007\xD0\xE1 B\x007\xC8\xE1 B\x007\xC0\xE1 A\xE0\xE1jA\0A\x80\xFC\v\0$\0 \v!\x07\v A\0A\xCC\xFC\v\0$\0 \x07\v\x9A\x1B$\x7F#\0A\xD0k"\r$\0\x7F A\xFFM@ \r :\0 \rA\0:\0\0@ E"\b\r\0 \b\r\0 \rAj  \xFC\n\0\0\v Aj\f\vA\0\v"\x7F#\0" A\xC0\xC2kA`q"$\0 A\x80\xF8j"" )\07\0  )\07\0  )\0\b7\0\b  )\0\x007\0\0 A\xE0\xF8j"\n" )\x0087\0  )\x0007\0  )\0(7\0\b  )\0 7\0\0 A\xA0\xF8j" )\0x7\x008  )\0p7\x000  )\0h7\0(  )\0`7\0   )\0X7\0  )\0P7\0  )\0H7\0\b  )\0@7\0\0 A\x80\xE0\0j"\b A\x80j"	\v \bA\x80\bj 	A\x80j\v \bA\x80j 	A\x80j\v \bA\x80j 	A\x80j\v \bA\x80 j 	A\x80j\v \b  A\x80j"\b\v A\x80\bj \bA\x80j\v A\x80j \bA\x80j\v A\x80j \bA\x80j\v A\x80 j \bA\x80j\v A\x80(j \bA\x80j\v % A\x800j"\b A\x80\fj" \bA\x80\bj A\xA0j \bA\x80j A\xC0j \bA\x80j A\xE0	j \bA\x80 j A\x80\rj \bA\x80(j A\xA0j \b% A\x80\xF9j"  \r   1 A\x80\x88j"A\0A\xCC\xFC\v\0  \nA   \x07A   A\xC0\0 \r A\xC0\xF9j"A\xC0\0 \f A\0A\xD0\xFC\v\0 A\0A\xD0\xFC\v\0 \0A\xB0j!  ( A\x80\xE2j! A\x80\xB2j! A\x80\xDAj! A\x80\xAAj! A\x80\xD2j!\x1B A\x80\xA2j! A\x80\xCAj! A\x80\x9Aj! A\x80\xC2j! A\x80\x92j!  A\x80\xBAj!! A\x80\x80j!" A\x80\xB2j!# A\x80\xF8\0j!$ A\x80\xAAj!% A\x80\xF0\0j!& A\x80\xA2j!\' A\x80\xE8\0j!( A\x80\xEAj!A\0!\x7F@ A\x80\x9Aj"\x07A\x80\bj!\v \x07A\x80j!\f \x07A\x80j! A\xFF\xFFqAl"\bA\xFF\xFFq!#\0" A\xA0kA`q"$\0  )\x0087\xD8  )\x0007\xD0  )\0(7\xC8  )\0 7\xC0  )\07\xB8  )\07\xB0  )\0\b7\xA8  )\0\x007\xA0  )\0\x007\x80\x07  )\0\b7\x88\x07  )\07\x90\x07  )\07\x98\x07  )\0 7\xA0\x07  )\0(7\xA8\x07  )\x0007\xB0\x07  )\x0087\xB8\x07  )\0\x007\xE0\x07  )\0\b7\xE8\x07  )\07\xF0\x07  )\07\xF8\x07  )\0 7\x80\b  )\0(7\x88\b  )\x0007\x90\b  )\x0087\x98\b  )\0\x007\xC0\b  )\0\b7\xC8\b  )\07\xD0\b  )\07\xD8\b  )\0 7\xE0\b  )\0(7\xE8\b  )\x0087\xF8\b  )\x0007\xF0\b  \bAjA\xFF\xFFq"	:\0\x80	  	A\bv:\0\x81	  \bAjA\xFF\xFFq"	:\0\xA0\b  	A\bv:\0\xA1\b  \bAjA\xFF\xFFq"	:\0\xC0\x07  	A\bv:\0\xC1\x07  :\0\xE0  A\bv:\0\xE1  A\xA0j A\x80\x07j A\xE0\x07j A\xC0\bj, A\xA0	j A\xE0j" A\xA0j") A\xE0j"*A #A\0!A\0!	@ A\xA0	j 	Alj"\n/\0\0! \x07 	Atj"A\x80\x80  \n-\0At \n-\0"+Avr \n-\0A\ftrk6 A\x80\x80   +AtA\x80\x80<qrk6\0 	Aj"	A\x80G\r\0\v@  Alj"	/\0\0!\n \v Atj"A\x80\x80  	-\0At 	-\0"Avr 	-\0A\ftrk6 A\x80\x80  \n AtA\x80\x80<qrk6\0 Aj"A\x80G\r\0\vA\0!@ ) Alj"	/\0\0!\n \f Atj"\vA\x80\x80  	-\0At 	-\0"Avr 	-\0A\ftrk6 \vA\x80\x80  \n AtA\x80\x80<qrk6\0 Aj"A\x80G\r\0\vA\0!@ * Alj"	/\0\0!\n  Atj"\vA\x80\x80  	-\0At 	-\0"\fAvr 	-\0A\ftrk6 \vA\x80\x80  \n \fAtA\x80\x80<qrk6\0 Aj"A\x80G\r\0\v A\0A\xA0\xFC\v\0 A\xA0	jA\0A\x80\xFC\v\0 A\xA0jA\0A\x80\xFC\v\0$\0 \x07A\x80 j!	#\0" A\x80\bkA`q"$\0  )\0\x007\xE0  )\0\b7\xE8  )\07\xF0  )\07\xF8  )\0 7\x80  )\0(7\x88  )\x0007\x90  )\x0087\x98  \bAj;\xA0 Aj"A\0A\xCC\xFC\v\0  A\xE0jA\xC2\0 \r A\xC0jA\xA8 \fA\0!@ A\xC0j"\v Alj"\b/\0\0!\f 	 Atj"A\x80\x80  \b-\0At \b-\0"Avr \b-\0A\ftrk6 A\x80\x80  \f AtA\x80\x80<qrk6\0 Aj"A\x80G\r\0\v AjA\0A\xD0\xFC\v\0 \vA\0A\xA8\xFC\v\0 A\xE0jA\0A\xC2\0\xFC\v\0$\0  \x07A\x80(\xFC\n\0\0  A\x80\x8Aj" A\x80\x88j \' $ & A\x80\xBAj"  A\x80\bj A\x80\bj A\x80j A\x80j A\x80j A\x80j A\x80 j A\x80 j A\x80(j A\x80(j \0 2 A\x80\x92j"A\0A\xCC\xFC\v\0  A\xC0\0  \0A\x80 \r A\x80\xC2j"A0 \f A\0A\xD0\xFC\v\0 A\0A\xD0\xFC\v\0 A\x80\x82j"\b ) \b  A\x80\xE0\0jA\x80\b\xFC\n\0\0 A\x80\xFAj" \b    \x07	 \x07A\0!	@ A\xBC\xFE\b\r\0 \0 A\0  (A\x80\b\xFC\n\0\0  \b    \'	 \x07 A\xBC\xFE\b\r\0 \0 A  &A\x80\b\xFC\n\0\0  \b    %	 \x07 A\xBC\xFE\b\r\0 \0 A  $A\x80\b\xFC\n\0\0  \b    #	 \x07 A\xBC\xFE\b\r\0 \0 A  "A\x80\b\xFC\n\0\0  \b    !	 \x07 A\xBC\xFE\b\r\0 \0 AA\0!\x07@ A\x80\xFAj"  \x07A\nt"\njA\x80\b\xFC\n\0\0 A\x80\x92j" A\x80\x82j"\v    A\x80\x8Aj"\f \nj"\bA\x80\b\xFC\n\0\0   \x07 A\xBC\xFC\b \b A\x80\b\xFC\n\0\0\r  A\x800j \njA\x80\b\xFC\n\0\0  \v   \x07 A\x80\xFE\b\r  \bA\x80\b\xFC\n\0\0  	 \b A\x80\b\xFC\n\0\0 \x07Aj"\x07AG\r\0\v \0 A\x80\xC2j")\0(7\0( \0 )\0 7\0  \0 )\07\0 \0 )\07\0 \0 )\0\b7\0\b \0 )\0\x007\0\0 B\x007\x005 B\x007\x000 B\x007\0( B\x007\0  B\x007\0 B\x007\0 B\x007\0\b B\x007\0\0  \f A\x80\xBAj"A7K\r\0 \0 A\0A\0     j"\x07A7K\r\0 \0 A     \x07j"A7K\r\0 \0 A \x07   \x1B j"\x07A7K\r\0 \0 A     \x07j"A7K\r\0 \0 A \x07    jA7K\r\0 \0 A A!	\v A\x80\xFAjA\0A\x80\b\xFC\v\0 A\x80\x82jA\0A\x80\b\xFC\v\0 A\x80\x8AjA\0A\x800\xFC\v\0 A\x80\xBAjA\0A\x80\xD8\0\xFC\v\0 A\x80\x92jA\0A\x80\b\xFC\v\0 A\x80\x9AjA\0A\x80(\xFC\v\0 B\x007\xA8\xC2 B\x007\xA0\xC2 B\x007\x98\xC2 B\x007\x90\xC2 B\x007\x88\xC2 B\x007\x80\xC2 	@ A\xED6\0A\0\f\v Aj"A\xFF\xFFqA\xB2\xE6\0G\r\0\v A\x006\0 \0A\0A\xED\xFC\v\0A\x7F\v!\0 A\0A\x800\xFC\v\0 A\x800jA\0A\x800\xFC\v\0 A\x80\xE0\0jA\0A\x80(\xFC\v\0 A\x80\x88jA\0A\x80\xF0\xFC\v\0 A\x80\xF8jA\0A\x80\xFC\v\0$\0 \0A\x7F\v \rA\xD0j$\0\v\xAD	\x7F#\0"A\x80\xBAkA`q"$\0  )\0\x007\xC0\xB8  )\0\b7\xC8\xB8  )\07\xD0\xB8  )\07\xD8\xB8 A\x86\n;\xE0\xB8 A\x80\xB9j"A\x80 A\xC0\xB8jA"/ A\x80\x90j" A\x80\x98j A\x80\xA0j A\x80\xA8j A\xA0\xB9j"	A\0AAA A\x80\xB0j A\x80\xE0\0j"\x07 A\x80\xE8\0j A\x80\xF0\0j" 	AAAA\xFF  A\x80\xF8\0j A\x80\x80j A\x80\x88j 	A\x07A\bA	A\n#\0"A\x80\xC8kA`q"$\0 A\x80\xD8\0j" ( A\x800j"\n A\x80(\xFC\n\0\0 \n   \n\' $  \x07	 A\x80\bj"\v \x07A\x80\bj"	 A\x80j"\f \x07A\x80j"	 A\x80j"\r \x07A\x80j"	 A\x80 j"	 \x07A\x80 j"	 A\x80(j" \x07A\x80(j"	 3 & A\x800j"\b   \bA\x80\bj" A\x80\bj" \v \bA\x80j" A\x80j" \f \bA\x80j" A\x80j"\x1B \r \bA\x80 j"\v A\x80 j"\f 	 \bA\x80(j"\r A\x80(j"	  \0" )\07\0 \0 )\07\0 \0 )\0\b7\0\b \0 )\0\x007\0\0 \0A j \b \0A\xE0j  \0A\xA0j  \0A\xE0\x07j  \0A\xA0\nj \v \0A\xE0\fj \r A\x80\xB8j"\0A\xC0\0 A\xA0/ A\0A\x800\xFC\v\0 \nA\0A\x80(\xFC\v\0 A\0A\x80\xF0\xFC\v\0 $\0  )\07\0  )\07\0  )\0\b7\0\b  )\0\x007\0\0  A\xE0\xB9j")\0\x007\0   )\0\b7\0(  )\07\x000  )\07\x008  \0)\0\x007\0@  \0)\0\b7\0H  \0)\07\0P  \0)\07\0X  \0)\0 7\0`  \0)\0(7\0h  \0)\x0007\0p  \0)\x0087\0x A\x80j"\0 \n \0A\x80j A\x80\bj\n \0A\x80j A\x80j\n \0A\x80j A\x80j\n \0A\x80j A\x80 j\n A\x80j"\0 \x07\n \0A\x80j \n \0A\x80j \n \0A\x80j \n \0A\x80j \n \0A\x80j \n A\x80\fj"\0  \0A\xA0j  \0A\xC0j  \0A\xE0	j \x1B \0A\x80\rj \f \0A\xA0j 	 A\0A\x800\xFC\v\0 \bA\0A\x800\xFC\v\0 \x07A\0A\x800\xFC\v\0 A\0A\x80(\xFC\v\0 B\x007\xB8\xB8 B\x007\xB0\xB8 B\x007\xA8\xB8 B\x007\xA0\xB8 B\x007\x98\xB8 B\x007\x90\xB8 B\x007\x88\xB8 B\x007\x80\xB8 A\0;\xE0\xB8 B\x007\xD8\xB8 B\x007\xD0\xB8 B\x007\xC8\xB8 B\x007\xC0\xB8 A\0A\x80\xFC\v\0 $\0A\0\v4\x7F@ \0At" A\xE0j"6\xE4  6\xE8 \0Aj"\0A\xC0\0G\r\0\vA0*\v\v\xBD\v\0A\x84\b\v\xAC\v\xF7d\0\01\xD8\xFF\xF8\xFFD\x9E\0!\xF4\xFF(\xA1\xF2\xFF$\x07\0+\xDE\x1B\0+\xE9#\0\xAD\x84\xFA\xFF\x7F\xE0\xFFu\x9A/\0	\xFB\xD3\xFFIz/\0\'\xE5(\0X\x96)\0p\xA0\0\xA4\x85\xEF\xFF\x88\xB76\0\x90\x9D\xF7\xFF\xA0\xEA\xEE\xFFh\xF9\'\0{\xD3\xDF\xFF\xD6\xAD\xDF\xFF\xE7\xC5\xFF\xF7\xA4\xEA\xFF\x98\xFC\xCD\xFF5\xD0\0"\xB4\xFF\xFF2=\0\xC5E\0gJ)\0 v\0\xCD\xF4.\0\xC5\xDE5\0\xA5\xE6\xFF,0\xC9\xFF\xD4G\xD9\xFF\xAF\xBE;\0\x85\xC5\xFF|\x8E\xD1\xFF\x96\x8A6\0A>\xD4\xFF\06\0Mj\xFB\xFF\x9C\xD6#\0]\xC5\xF7\xFF=\xE6\xFF\xD6\xEA\xE6\xFF~5\0Y\xAF\xC5\xFF?\x845\0V\xDF\xFF\\\x94\xE7\xFF\x8Cs8\0\xA8c\f\0\x9A\x1B\b\0v\x8F\0S8;\x004\x85;\x000\xFC\xD8\xFFT\x9D\0-O\xD5\xFF\xE5\xC4\xFF\x81\xAC\xE8\xFF\xCF\xE1\xC7\xFF\x98\xD1\xFF]\xD6\xE9\xFF\xEE	5\0\xC75!\0\xBB\xCF\xE7\xFFu\xCF\xEC\xFFr\x97\0r\xB0\xC1\xFF\xF6\xBC\xF0\xFF\x80R\xCF\xFF\xAE\xD2\xCF\xFF\xE0\x90\xC8\xFF\xCA\xEF\0\xF24\0\x85\xFE\xF0\xFF8\xC6 \0\x9Fn)\0\xA3\xB7\xD2\xFFK\xA4\xC7\xFFm\xBA\xF9\xFF	4\xDA\xFF\x82\xC2\xF5\xFFA\xED\xFF;\xA6\xFF\xFF\xF7	\xEC\xFF\xDD+\xFA\xFF\xD4\x95\0cE\0b,\xEA\xFF\xE9\xFB\xCC\xFF\xF0\n\0\xC4\x07\0\x88E/\0\0\xAD\0\0\xBE6\xEF\xFFD\xCD\r\0Zg<\0\xCA+\xC7\xFF~\xDE\xFF\xFFH9\0\xC0i\xCE\xFFlu$\0\xDF\xC7\xFC\xFF\xA1\x98\v\0\b\xE8\xEB\xFFl\xE4\0\b\xC8\xC9\xFF\xC260\0\xF6\xBF\xE3\xFF\x93<\xDB\xFF\xE0J\xFD\xFF\0\x92w\0%\x9E\0\xE0\xD0\xE7\xFFD\x99\xF3\xFF\b\xEA\xFF\xA2\xEE\xD1\xFF\x9C\xC7\xC4\xFFW\xA0\xC8\xFF\xD9\x97:\0\x93\xEA\0Z\xFF3\0\xD4X#\0\xF8A:\0r\xFF\xCC\xFF\xFB="\0\x9F\xAB\xDA\xFF"\xA4\xC9\xFF\xF5\0\x87%%\0\xF0$\xED\xFF]\x9B5\0\xA0H\xCA\xFF\xFC\xA2\xC6\xFFV\xBB\xED\xFF\xDEE\xCF\xFF^\xBE\r\0^\0\xE6\xE0\r\0Z\x7F\f\0\x83\x8F\x07\0\x8Ab\xE7\xFFW\xFF\xFF\xFC\xF8\xFF!\0\xF6\xFF\xF6Z\xD0\xFF\x84\0\0\x86\xEF0\0}\xB9\xC9\xFF\xD6\xFC\xF7\xFF\x92E\xF4\xFF\xC2!\xC9\xFF9\0\fa\0A\xCD\xDA\xFF\x1B\xB0>\0\xE7r4\0;\0\xCD\xFF\xC7|\0$\0\xE5^+\0\x99)\0:z\xD8\xFFqM\0\xE1=\0\x84	\0Q\xF0%\0FZ\0\x85\xC6\xFF\xBE\0\x918(\0\x90\xDB\xC9\xFF\x89P\xD2\xFF?\x85\0K\v\0\xA6\xF6\xEF\xFF\xBE\xA8\xEB\xFF\x1B\xE1\0>^\xCD\xFF/-\xEA\xFF\xE4\xF9\xFF\xC7\0\x83r2\0n\r\xE2\xFFSy\xEC\xFF\x99@\0x%\xD9\xFF\xAD\xEB\xFF\xE4\0\xE7\xDB\v\0\xE8"\0\xCF\xF83\x004\xB9\xF7\xFF\f\xCA\xD4\xFF\xF8\x7F\xE6\xFFW\xD1\xE3\xFF\x1B\x91\xD8\xFF,\xC7\xFF\xD8	\0^\xC6\xFFXF\xE1\xFF\x8B%\0\xB7s%\0\x8F|\xFD\xFF\x98\xDD\0\x98h3\0\xBB\xD4\0\xA7\x93\xED\xFF\xBEl\xCF\xFF|\0\b\xAA\0q\xFD-\0\xA5\\\f\0\x9A7\0g\xA1\xC7\xFF=\x8C\xE4\xFF<\xA1\xD1\xFF9\xC55\0;\0\xC0\0\xF7\xC4!\0\xF4\x1B\xF1\xFF\xE75\04\x07\0E}\xF9\xFF\xD0L\0\xAE|\xE4\xFFh&\0\x98\x8E\xE6\xFF3&\xEF\xFF\xDA\xFC\xFF\xDB\x7F\xC5\xFFd\'\xD3\xFF\xAF\xE1\xDD\xFF\xDD\x93\xF9\xFF	\xDD\xFF\x93\xCC\0\xF1\xFF*\x9C\0\xA9\xE5\xC9\xFFP\x8A\xF7\xFF,\xCF;\0NC\xFF\xFF\xDF6\xEB\xFF\xCA<\0h^\0\xB6\xF3\xFF\xCE)\0\0\0\0	`\x86He\0\0\0\0	`\x86He\0\0\0\0	`\x86He\0\0\0\0	`\x86He\0\0\0\0	`\x86He\0\0\0\0	`\x86He\0\x07\0\0\0	`\x86He\x07\0\b\0\0\0	`\x86He\b\0	\0\0\0	`\x86He	\0\n\0\0\0	`\x86He\n\0\v\0\0\0	`\x86He\v\0\f\0\0\0	`\x86He\f\0\0\b\0\0\b\0\0 \b\0\x000\b\0\0@\b\0\0P\b\0\0`\b\0\0p\b\0\0\x80\b\0\0\x90\b\0\0\xA0\b\0\0\xB0\b\0\0\0\0\0\0\0\0\0\x82\x80\0\0\0\0\0\0\x8A\x80\0\0\0\0\0\x80\0\x80\0\x80\0\0\0\x80\x8B\x80\0\0\0\0\0\0\0\0\x80\0\0\0\0\x81\x80\0\x80\0\0\0\x80	\x80\0\0\0\0\0\x80\x8A\0\0\0\0\0\0\0\x88\0\0\0\0\0\0\0	\x80\0\x80\0\0\0\0\n\0\0\x80\0\0\0\0\x8B\x80\0\x80\0\0\0\0\x8B\0\0\0\0\0\0\x80\x89\x80\0\0\0\0\0\x80\x80\0\0\0\0\0\x80\x80\0\0\0\0\0\x80\x80\0\0\0\0\0\0\x80\n\x80\0\0\0\0\0\0\n\0\0\x80\0\0\0\x80\x81\x80\0\x80\0\0\0\x80\x80\x80\0\0\0\0\0\x80\0\0\x80\0\0\0\0\b\x80\0\x80\0\0\0\x80\0A\xB0\v\xF0\r');
  }
  function getBinarySync(file) {
    return file;
  }
  async function getWasmBinary(binaryFile) {
    return getBinarySync(binaryFile);
  }
  async function instantiateArrayBuffer(binaryFile, imports) {
    try {
      var binary = await getWasmBinary(binaryFile);
      var instance = await WebAssembly.instantiate(binary, imports);
      return instance;
    } catch (reason) {
      err(`failed to asynchronously prepare wasm: ${reason}`);
      abort(reason);
    }
  }
  async function instantiateAsync(binary, binaryFile, imports) {
    return instantiateArrayBuffer(binaryFile, imports);
  }
  function getWasmImports() {
    var imports = { a: wasmImports };
    return imports;
  }
  async function createWasm() {
    function receiveInstance(instance, module) {
      wasmExports = instance.exports;
      assignWasmExports(wasmExports);
      updateMemoryViews();
      return wasmExports;
    }
    function receiveInstantiationResult(result2) {
      return receiveInstance(result2["instance"]);
    }
    var info = getWasmImports();
    wasmBinaryFile ??= findWasmBinary();
    var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
    var exports = receiveInstantiationResult(result);
    return exports;
  }
  class ExitStatus {
    name = "ExitStatus";
    constructor(status) {
      this.message = `Program terminated with exit(${status})`;
      this.status = status;
    }
  }
  function getValue(ptr, type = "i8") {
    if (type.endsWith("*")) type = "*";
    switch (type) {
      case "i1":
        return HEAP8[ptr];
      case "i8":
        return HEAP8[ptr];
      case "i16":
        return HEAP16[ptr >> 1];
      case "i32":
        return HEAP32[ptr >> 2];
      case "i64":
        return HEAP64[ptr >> 3];
      case "float":
        return HEAPF32[ptr >> 2];
      case "double":
        return HEAPF64[ptr >> 3];
      case "*":
        return HEAPU32[ptr >> 2];
      default:
        abort(`invalid type for getValue: ${type}`);
    }
  }
  function setValue(ptr, value, type = "i8") {
    if (type.endsWith("*")) type = "*";
    switch (type) {
      case "i1":
        HEAP8[ptr] = value;
        break;
      case "i8":
        HEAP8[ptr] = value;
        break;
      case "i16":
        HEAP16[ptr >> 1] = value;
        break;
      case "i32":
        HEAP32[ptr >> 2] = value;
        break;
      case "i64":
        HEAP64[ptr >> 3] = BigInt(value);
        break;
      case "float":
        HEAPF32[ptr >> 2] = value;
        break;
      case "double":
        HEAPF64[ptr >> 3] = value;
        break;
      case "*":
        HEAPU32[ptr >> 2] = value;
        break;
      default:
        abort(`invalid type for setValue: ${type}`);
    }
  }
  var stackRestore = (val) => __emscripten_stack_restore(val);
  var stackSave = () => _emscripten_stack_get_current();
  var getHeapMax = () => 2147483648;
  var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
  var growMemory = (size) => {
    var oldHeapSize = wasmMemory.buffer.byteLength;
    var pages = (size - oldHeapSize + 65535) / 65536 | 0;
    try {
      wasmMemory.grow(pages);
      updateMemoryViews();
      return 1;
    } catch (e) {
    }
  };
  var _emscripten_resize_heap = (requestedSize) => {
    var oldSize = HEAPU8.length;
    requestedSize >>>= 0;
    var maxHeapSize = getHeapMax();
    if (requestedSize > maxHeapSize) {
      return false;
    }
    for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
      var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
      overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
      var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
      var replacement = growMemory(newSize);
      if (replacement) {
        return true;
      }
    }
    return false;
  };
  var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
  for (var base64ReverseLookup = new Uint8Array(123), i = 25; i >= 0; --i) {
    base64ReverseLookup[48 + i] = 52 + i;
    base64ReverseLookup[65 + i] = i;
    base64ReverseLookup[97 + i] = 26 + i;
  }
  base64ReverseLookup[43] = 62;
  base64ReverseLookup[47] = 63;
  {
  }
  Module["stackSave"] = stackSave;
  Module["stackRestore"] = stackRestore;
  Module["stackAlloc"] = stackAlloc;
  Module["setValue"] = setValue;
  Module["getValue"] = getValue;
  var _mldsa65_keypair, _mldsa65_sign, _mldsa65_verify, _free, _malloc, __emscripten_stack_restore, __emscripten_stack_alloc, _emscripten_stack_get_current, memory, __indirect_function_table, wasmMemory;
  function assignWasmExports(wasmExports2) {
    _mldsa65_keypair = Module["_mldsa65_keypair"] = wasmExports2["d"];
    _mldsa65_sign = Module["_mldsa65_sign"] = wasmExports2["e"];
    _mldsa65_verify = Module["_mldsa65_verify"] = wasmExports2["f"];
    _free = Module["_free"] = wasmExports2["g"];
    _malloc = Module["_malloc"] = wasmExports2["h"];
    __emscripten_stack_restore = wasmExports2["i"];
    __emscripten_stack_alloc = wasmExports2["j"];
    _emscripten_stack_get_current = wasmExports2["k"];
    memory = wasmMemory = wasmExports2["b"];
    __indirect_function_table = wasmExports2["__indirect_function_table"];
  }
  var wasmImports = { a: _emscripten_resize_heap };
  function run() {
    preRun();
    function doRun() {
      Module["calledRun"] = true;
      if (ABORT) return;
      initRuntime();
      readyPromiseResolve?.(Module);
      postRun();
    }
    {
      doRun();
    }
  }
  var wasmExports;
  wasmExports = await createWasm();
  run();
  if (runtimeInitialized) {
    moduleRtn = Module;
  } else {
    moduleRtn = new Promise((resolve, reject) => {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
  }
  ;
  return moduleRtn;
}
var wasm_module_default = MLDSA65Module;

// src/mldsa.ts
var ALGORITHM_NAME = "ML-DSA-65";
var JWK_ALG = "ML-DSA-65";
var KEY_USAGES = ["sign", "verify"];
var MlDsaOperationError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "OperationError";
  }
};
var MlDsaInvalidAccessError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidAccessError";
  }
};
var MlDsaNotSupportedError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "NotSupportedError";
  }
};
var MlDsaDataError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "DataError";
  }
};
var internalKeyData = /* @__PURE__ */ new WeakMap();
function getInternalKeyData(key) {
  const keyData = internalKeyData.get(key);
  if (!keyData) {
    throw new TypeError("Unknown key object");
  }
  return keyData;
}
var cleanupRegistry = new FinalizationRegistry((keyData) => {
  keyData.publicKeyData.fill(0);
  keyData.privateSeedData?.fill(0);
  keyData.privateSecretKeyData?.fill(0);
});
function getPublicKeyDataRef(key) {
  const keyData = getInternalKeyData(key);
  if (!keyData.publicKeyData) {
    throw new MlDsaOperationError("Failed to get public key data");
  }
  return keyData.publicKeyData;
}
function getPrivateKeyDataRef(key) {
  const keyData = getInternalKeyData(key);
  if (!keyData.privateSeedData || !keyData.privateSecretKeyData) {
    throw new MlDsaOperationError("Failed to get private key data");
  }
  return keyData;
}
var noClone = Symbol("CryptoKey created by mldsa-wasm cannot be cloned");
var keyIdKey = "_mldsa_wasm";
var emptyToJSON = () => ({});
function createKeyObject(type, extractable, usages, keyData) {
  const key = {
    type,
    extractable,
    algorithm: Object.freeze({ name: ALGORITHM_NAME }),
    usages: Object.freeze(Array.from(usages)),
    [keyIdKey]: noClone
    // to prevent structured cloning
  };
  Object.defineProperty(key, "toJSON", {
    value: emptyToJSON,
    writable: false,
    enumerable: false,
    configurable: false
  });
  Object.setPrototypeOf(key, CryptoKey.prototype);
  internalKeyData.set(key, keyData);
  cleanupRegistry.register(key, keyData);
  return Object.freeze(key);
}
function createPublicKey(publicKeyData, usages) {
  return createKeyObject("public", true, usages, { publicKeyData });
}
function createPrivateKey(publicKeyData, privateSeedData, privateSecretKeyData, extractable, usages) {
  return createKeyObject("private", extractable, usages, {
    publicKeyData,
    privateSeedData,
    privateSecretKeyData
  });
}
function _isSupportedCryptoKey(key) {
  return key instanceof CryptoKey && keyIdKey in key && key[keyIdKey] == noClone && internalKeyData.has(key);
}
function toBase64url(data) {
  return btoa(String.fromCharCode(...data)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64url(base64url) {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "===".slice((base64.length + 3) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
var PUBLICKEY_BYTES = 1952;
var SECRETKEY_BYTES = 4032;
var SIGNATURE_BYTES = 3309;
var KEYPAIR_SEED_BYTES = 32;
var SIGN_RANDOM_BYTES = 32;
var _module;
async function getModule() {
  if (!_module) {
    _module = await wasm_module_default();
  }
  return _module;
}
var getRandomValues = crypto.getRandomValues.bind(crypto);
function normalizeAlgorithm(algorithm) {
  const name = typeof algorithm === "string" ? algorithm.toUpperCase() : typeof algorithm === "object" && algorithm !== null && "name" in algorithm && typeof algorithm.name === "string" ? algorithm.name.toUpperCase() : null;
  if (name !== ALGORITHM_NAME) {
    throw new TypeError("Unsupported algorithm");
  }
  const context = typeof algorithm === "object" && algorithm !== null && "context" in algorithm ? algorithm.context : void 0;
  return { name: ALGORITHM_NAME, context };
}
async function internalGenerateKeyPair(coins) {
  const module = await getModule();
  let pkPtr = 0, skPtr = 0, coinsPtr = 0;
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
async function generateKey(keyAlgorithm, extractable, usages) {
  normalizeAlgorithm(keyAlgorithm);
  if (!Array.isArray(usages) || usages.some((usage) => !KEY_USAGES.includes(usage))) {
    throw new SyntaxError("Invalid key usages");
  }
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
    privateKey
  };
}
var MLDSA65_SPKI = {
  fullLength: 1974,
  prefix: new Uint8Array([
    48,
    130,
    7,
    178,
    48,
    11,
    6,
    9,
    96,
    134,
    72,
    1,
    101,
    3,
    4,
    3,
    18,
    3,
    130,
    7,
    161,
    0
  ])
};
var MLDSA65_PKCS8 = {
  fullLength: 54,
  prefix: new Uint8Array([
    48,
    52,
    2,
    1,
    0,
    48,
    11,
    6,
    9,
    96,
    134,
    72,
    1,
    101,
    3,
    4,
    3,
    18,
    4,
    34,
    128,
    32
  ])
};
function bytesEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
function derToRaw(encoding, der) {
  if (der.length !== encoding.fullLength) {
    throw new MlDsaDataError("Invalid encoding");
  }
  const prefix = der.subarray(0, encoding.prefix.length);
  if (!bytesEqual(prefix, encoding.prefix)) {
    throw new MlDsaNotSupportedError("Unsupported encoding");
  }
  return der.slice(encoding.prefix.length);
}
function rawToDer(encoding, raw) {
  const der = new Uint8Array(encoding.fullLength);
  der.set(encoding.prefix);
  der.set(raw, encoding.prefix.length);
  return der;
}
async function exportKey(format, key) {
  if (!(key instanceof CryptoKey)) {
    throw new TypeError("Expected key to be an instance of CryptoKey");
  }
  normalizeAlgorithm(key.algorithm);
  if (!key.extractable) {
    throw new MlDsaOperationError("Key is not extractable");
  }
  if (format === "spki") {
    if (key.type !== "public") {
      throw new TypeError("Expected key type to be 'public'");
    }
    return rawToDer(MLDSA65_SPKI, getPublicKeyDataRef(key)).buffer;
  }
  if (format === "pkcs8") {
    if (key.type !== "private") {
      throw new MlDsaInvalidAccessError("Expected key type to be 'private'");
    }
    return rawToDer(MLDSA65_PKCS8, getPrivateKeyDataRef(key).privateSeedData).buffer;
  }
  if (format === "raw-public") {
    if (key.type !== "public") {
      throw new TypeError("Expected key type to be 'public'");
    }
    return new Uint8Array(getPublicKeyDataRef(key)).buffer;
  }
  if (format === "raw-seed") {
    if (key.type !== "private") {
      throw new MlDsaInvalidAccessError("Expected key type to be 'private'");
    }
    return new Uint8Array(getPrivateKeyDataRef(key).privateSeedData).buffer;
  }
  if (format === "jwk") {
    const jwk = {
      // Set the kty attribute of jwk to "AKP".
      kty: "AKP",
      // Set the alg attribute of jwk to the name member of normalizedAlgorithm.
      alg: JWK_ALG,
      // Set the pub attribute of jwk to the base64url encoded public key
      // corresponding to the [[handle]] internal slot of key.
      pub: toBase64url(getPublicKeyDataRef(key))
    };
    if (key.type === "private") {
      jwk.priv = toBase64url(getPrivateKeyDataRef(key).privateSeedData);
    }
    jwk.key_ops = key.usages;
    jwk.ext = key.extractable;
    return jwk;
  }
  throw new MlDsaNotSupportedError("Format not supported");
}
function bufferSourcetoUint8Array(value) {
  if (ArrayBuffer.isView(value) && value.buffer instanceof ArrayBuffer) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  } else if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  } else {
    throw new TypeError("Value must be a BufferSource");
  }
}
function bufferSourcetoUint8ArrayCopy(value) {
  return bufferSourcetoUint8Array(value).slice();
}
async function importKey(format, keyData, algorithm, extractable, usages) {
  normalizeAlgorithm(algorithm);
  if (format === "spki") {
    if (!Array.isArray(usages) || usages.some((usage) => usage !== "verify")) {
      throw new SyntaxError("Invalid key usages for public key");
    }
    const data = derToRaw(MLDSA65_SPKI, bufferSourcetoUint8Array(keyData));
    if (data.length !== PUBLICKEY_BYTES) {
      throw new MlDsaDataError("Invalid key length");
    }
    return createPublicKey(data, usages);
  }
  if (format === "pkcs8") {
    if (!Array.isArray(usages) || usages.some((usage) => usage !== "sign")) {
      throw new SyntaxError("Invalid key usages for private key");
    }
    const data = derToRaw(MLDSA65_PKCS8, bufferSourcetoUint8Array(keyData));
    if (data.length !== KEYPAIR_SEED_BYTES) {
      throw new MlDsaDataError("Invalid key length");
    }
    const { rawPublicKey, rawSecretKey, rawSeed } = await internalGenerateKeyPair(data);
    return createPrivateKey(
      rawPublicKey,
      rawSeed,
      rawSecretKey,
      extractable,
      usages
    );
  }
  if (format === "raw-public") {
    if (!Array.isArray(usages) || usages.some((usage) => usage !== "verify")) {
      throw new SyntaxError("Invalid key usages for public key");
    }
    const data = bufferSourcetoUint8ArrayCopy(keyData);
    return createPublicKey(data, usages);
  }
  if (format === "raw-seed") {
    if (!Array.isArray(usages) || usages.some((usage) => usage !== "sign")) {
      throw new SyntaxError("Invalid key usages for private key");
    }
    const data = bufferSourcetoUint8ArrayCopy(keyData);
    if (data.length !== KEYPAIR_SEED_BYTES) {
      throw new MlDsaDataError("Invalid key length");
    }
    const { rawPublicKey, rawSecretKey, rawSeed } = await internalGenerateKeyPair(data);
    return createPrivateKey(
      rawPublicKey,
      rawSeed,
      rawSecretKey,
      extractable,
      usages
    );
  }
  if (format === "jwk") {
    if (typeof keyData !== "object" || keyData === null) {
      throw new MlDsaDataError(
        "Expected keyData to be a JsonWebKey dictionary"
      );
    }
    const jwk = keyData;
    if (jwk.priv && usages.some((usage) => usage !== "sign") || !jwk.priv && usages.some((usage) => usage !== "verify")) {
      throw new SyntaxError("Invalid key usages for private key");
    }
    if (jwk.kty !== "AKP") {
      throw new MlDsaDataError("Invalid key type");
    }
    if (jwk.alg !== JWK_ALG) {
      throw new MlDsaDataError("Invalid algorithm");
    }
    if (usages.length > 0 && jwk.use && jwk.use !== "sig") {
      throw new MlDsaDataError("Invalid key usage");
    }
    if (jwk.key_ops && Array.isArray(jwk.key_ops) && !Array.prototype.every.call(
      jwk.key_ops,
      (op) => KEY_USAGES.includes(op)
    ) || !Array.isArray(jwk.key_ops)) {
      throw new MlDsaDataError("Invalid key operations");
    }
    if (jwk.ext === false && extractable) {
      throw new MlDsaDataError("Invalid key extractability");
    }
    if (jwk.priv) {
      try {
        const seedData = fromBase64url(jwk.priv);
        if (seedData.length !== KEYPAIR_SEED_BYTES) {
          throw new MlDsaDataError("Invalid private key length");
        }
        const { rawPublicKey, rawSecretKey, rawSeed } = await internalGenerateKeyPair(seedData);
        const key = createPrivateKey(
          rawPublicKey,
          rawSeed,
          rawSecretKey,
          extractable,
          usages
        );
        if (toBase64url(rawPublicKey) !== jwk.pub) {
          throw new MlDsaDataError("Invalid public key data");
        }
        return key;
      } catch {
        throw new MlDsaDataError("Invalid private key format");
      }
    } else {
      try {
        const publicKeyData = fromBase64url(jwk.pub);
        if (publicKeyData.length !== PUBLICKEY_BYTES) {
          throw new MlDsaDataError("Invalid public key data");
        }
        return createPublicKey(publicKeyData, usages);
      } catch {
        throw new MlDsaDataError("Invalid public key format");
      }
    }
  }
  throw new MlDsaNotSupportedError("Unsupported key format");
}
async function getPublicKey(key, usages) {
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
async function verify(algorithm, key, signature, message) {
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
  const ctx = normAlgo.context ? bufferSourcetoUint8Array(normAlgo.context) : null;
  const ctxLen = ctx == null ? 0 : ctx.length;
  if (ctxLen > 255) {
    throw new MlDsaDataError("Context is too long");
  }
  const msg = bufferSourcetoUint8Array(message);
  const msgLen = msg.length;
  let msgPtr = 0, sigPtr = 0, pkPtr = 0, ctxPtr = 0;
  try {
    sigPtr = module._malloc(SIGNATURE_BYTES);
    pkPtr = module._malloc(PUBLICKEY_BYTES);
    msgPtr = module._malloc(msgLen);
    ctxPtr = ctxLen > 0 ? module._malloc(ctxLen) : 0;
    if (sigPtr === 0 || pkPtr === 0 || msgPtr === 0 || ctxPtr === 0 && ctxLen > 0) {
      throw new MlDsaOperationError("Memory allocation failed");
    }
    module.HEAPU8.set(sig, sigPtr);
    module.HEAPU8.set(publicKeyData, pkPtr);
    module.HEAPU8.set(msg, msgPtr);
    if (ctxLen > 0) {
      module.HEAPU8.set(ctx, ctxPtr);
    }
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
async function sign(algorithm, key, data) {
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
  let skPtr = 0, rndPtr = 0, sigPtr = 0, ctxPtr = 0, msgPtr = 0;
  try {
    skPtr = module._malloc(SECRETKEY_BYTES);
    rndPtr = module._malloc(SIGN_RANDOM_BYTES);
    sigPtr = module._malloc(SIGNATURE_BYTES);
    ctxPtr = module._malloc(ctxLen);
    msgPtr = module._malloc(msgLen);
    if (skPtr === 0 || rndPtr === 0 || sigPtr === 0 || ctxPtr === 0 || msgPtr === 0) {
      throw new MlDsaOperationError("Failed to allocate memory");
    }
    module.HEAPU8.set(secretKeyData, skPtr);
    module.HEAPU8.set(randomness, rndPtr);
    module.HEAPU8.set(ctx, ctxPtr);
    module.HEAPU8.set(msg, msgPtr);
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
var mldsa = {
  generateKey,
  exportKey,
  importKey,
  getPublicKey,
  sign,
  verify,
  _isSupportedCryptoKey
};
var mldsa_default = mldsa;
export {
  mldsa_default as default
};

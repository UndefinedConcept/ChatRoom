var forge = require('node-forge');
var pki = forge.pki;
var rsa = forge.pki.rsa;

var keypair = rsa.generateKeyPair({bits: 2048, e: 0x10001});
var pubKeyPEM = pki.publicKeyToPem(keypair.publicKey);
var privKeyPEM = pki.privateKeyToPem(keypair.privateKey);
console.log(pubKeyPEM);
console.log(privKeyPEM);
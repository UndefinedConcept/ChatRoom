const forge = require('node-forge');
const pki = forge.pki;
const rsa = forge.pki.rsa;

const keypair = rsa.generateKeyPair({bits: 2048, e: 0x10001});
const pubKeyPEM = pki.publicKeyToPem(keypair.publicKey);
const privKeyPEM = pki.privateKeyToPem(keypair.privateKey);
console.log(pubKeyPEM);
console.log(privKeyPEM);


var xadesjs = require("xadesjs");
var { Crypto } = require("@peculiar/webcrypto");

xadesjs.Application.setEngine("NodeJS", new Crypto());

// Generate RSA key pair
let privateKey, publicKey;
xadesjs.Application.crypto.subtle.generateKey(
    {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 1024, //can be 1024, 2048, or 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: { name: "SHA-256" }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },
    false, //whether the key is extractable (i.e. can be used in exportKey)
    ["sign", "verify"] //can be any combination of "sign" and "verify"
)
.then(function (keyPair) {
    privateKey = keyPair.privateKey;

    // Call sign function
    return SignXml(xmlString, privateKey, 
        { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } });
})
.then(function (signedDocument) {
    console.log("Signed document:\n\n", signedDocument);
    next(null, signedDocument);
})
.catch(function (e) {
    console.log(e);
    next(e, null);
});
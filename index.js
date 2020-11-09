var xadesjs = require("xadesjs");
var { Crypto } = require("@peculiar/webcrypto");

xadesjs.Application.setEngine("NodeJS",new Crypto());

// const keys = await crypto.subtle.generateKey(
//     {
//         name: "RSASSA-PKCS1-v1_5",
//         hash: "SHA-256",
//         publicExponent: new Uint8Array([1, 0, 1]),
//         modulusLength: 2048,
//     },
//     false,
//     ["sign", "verify"],
// );

// const publicKey = await crypto.subtle.importKey(
//     "jwk",
//     {
//         alg: "RS256",
//         ext: true,
//         key_ops: ["verify"],
//         kty: "RSA",
//         e: "AQAB",
//         n: ""
//     },
//     {
//         name: "RSASSA-PKCS1-v1_5",
//         hash: "SHA-256",
//     },
//     false,
//     ["verify"],
// );

var privateKey, publicKey;
xadesjs.Application.crypto.subtle.generateKey(
    {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 1024,
        publicExponent: new Uint8Array([1, 0, 1]),
        // hash: "SHA-256",
        hash: { name: "SHA-256" },
    },
    false,
    ["sign", "verify"]
)
    .then(function (keyPair) {
        privateKey = keyPair.privateKey;
        publicKey = keyPair.publicKey;

        var xmlString = '<player bats="left" id="10012" throws="right">\n\t<!-- Here\'s a comment -->\n\t<name>Alfonso Soriano</name>\n\t<position>2B</position>\n\t<team>New York Yankees</team>\n</player>',
        return SignXml(xmlString, keyPair, { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } });
    })
    .then(function (signedDocument) {
        console.log("Signed document:\n\n", signedDocument);
        // const signature = await crypto.subtle.sign(
        //     "RSASSA-PKCS1-v1_5",
        //     privateKey,
        //     data,
        // );
    })
    .catch(function (e) {
        console.log(e);
    });

    function SignXml(xmlString, keys, algorithm) {
        return Promise.resolve()
        .then(() => {
            var xmlDoc = xadesjs.Parse(xmlString);
            var signedXml = new xadesjs.signedXml();

            return signedXml.Sign(
                algorithm,
                keys.privateKey,
                xmlDoc,
                {
                    keyValue: keys.publicKey,
                    references: [
                        { hash: "SHA-256", transforms: ["enveloped"] },
                    ],
                    productionPlace: {
                        country: "Country",
                        state: "State",
                        city: "City",
                        code: "Code"
                    },
                    signingCertificate: "",
                }
            )
        })
        .then(signature => signature.toString());
    }

    // function SignXml(xmlString, keys, algorithm) {
    //     return Promise.resolve()
    //     .then(() => {
    //         var xmlDoc = xadesjs.Parse(xmlString);
    //         var signedXml = new xadesjs.signedXml();

    //         return signedXml.Sign(
    //             algorithm,
    //             keys.privateKey,
    //             xmlDoc,
    //             {
    //                 keyValue: keys.publicKey,
    //                 references: [
    //                     { hash: "SHA-256", transforms: ["enveloped"] },
    //                 ]
    //             }
    //         )
    //         .then(() => {
    //             const sig = signature.toString();

    //             assert.equal(!!sig, true);

    //             const xades = xadesjs.signedXml(xadesjs.Parse(sig));
    //             xades.LoadXml(signature.XmlSignature.GetXml());

    //             assert.equal(!!xades.SignedProperties, true);
    //             assert.equal(!!xades.SignedProperties.SignedSignatureProperties.SigningTime, true);
    //             assert.equal(!!xades.SignedProperties.SignedSignatureProperties.SigningTime, true);
    //             assert.equal(xades.SignedProperties.SignedSignatureProperties.SignturePolicyIdentifier.IsEmpty(), true);
    //             assert.equal(xades.SignedProperties.SignedSignatureProperties.SignerRole.IsEmpty(), true);
    //             assert.equal(xades.SignedProperties.SignedSignatureProperties.SigningCertificate.IsEmpty(), true);
    //             assert.equal(xades.SignedProperties.SignedSignatureProperties.SignatureProductionPlace.IsEmpty(), true);

    //             return xades.Verify();
    //         })
    //         .then((res) => {
    //             assert.equal(res, true, "XAdES signature is not valid");
    //         })
    //         .then(signature => signature.toString());
    //     })
    // }
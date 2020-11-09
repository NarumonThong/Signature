var xadesjs = require("xadesjs");
var { Crypto } = require("@peculiar/webcrypto");

xadesjs.Application.setEngine("NodeJS", new Crypto());

var privateKey, publicKey;
xadesjs.Application.crypto.subtle.generateKey(
    {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 1024,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: { name: "SHA-256" },
    },
    true, 
    ["sign", "verify"] 
)
    .then(function (keyPair) {
        privateKey = keyPair.privateKey;
        publicKey = keyPair.publicKey;
        // console.log(keyPair);

        var xmlString = '<player></player>';
        // var xmlString = '<player bats="left" id="10012" throws="right">\n\t<!-- Here\'s a comment -->\n\t<name>Alfonso Soriano</name>\n\t<position>2B</position>\n\t<team>New York Yankees</team>\n</player>';
        return SignXml(xmlString, keyPair, { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } });
        
    })
    .then(function (signedDocument) {
        // console.log("Signed document:\n\n", signedDocument);

        console.log('ok');

        const fs = require('fs');
        const myConsole = new console.Console(fs.createWriteStream('test.xml'));
        myConsole.log(signedDocument);
    })
    .catch(function (e) {
        console.error(e);
    });

// function SignXml(xmlString, keys, algorithm) {
//     return Promise.resolve()
//         .then(() => {
//             var xmlDoc = xadesjs.Parse(xmlString);
//             var signedXml = new xadesjs.SignedXml();

//             return signedXml.Sign(               // Signing document
//                 algorithm,                              // algorithm
//                 keys.privateKey,                        // key
//                 xmlDoc,                                 // document
//                 {                                       // options
//                     keyValue: keys.publicKey,
//                     references: [
//                         { hash: "SHA-256", transforms: ["enveloped"] }
//                     ],
//                     productionPlace: {
//                         country: "Country",
//                         state: "State",
//                         city: "City",
//                         code: "Code",
//                     },
//                     signingCertificate: "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"
//                 })
//             })
//             .then(signature => signature.toString());
// }

function SignXml(xmlString, keys, algorithm) {
    return Promise.resolve()
        .then(() => {
            var xmlDoc = xadesjs.Parse(xmlString);
            var signedXml = new xadesjs.SignedXml();

            const cert = "MIIG+jCCBOKgAwIBAgIIHLeB5nMXOGswDQYJKoZIhvcNAQELBQAwVzEeMBwGA1UEAwwVVGhhaSBE aWdpdGFsIElEIENBIEczMSgwJgYDVQQKDB9UaGFpIERpZ2l0YWwgSUQgQ29tcGFueSBMaW1pdGVk MQswCQYDVQQGEwJUSDAeFw0xNzEyMjAwNTU2NTlaFw0yMDEyMTkwNTU2NTlaMIGmMQswCQYDVQQG EwJUSDEWMBQGA1UEYQwNMDEwNTU1MTExNDk0NDF/MH0GA1UEAwx24LiX4Liy4LiK4Li0LeC5gOC4 reC4qiDguK3guK3guYLguJXguYLguKHguJfguLXguJ8g4LiL4Li14LiX4LiV4Li04LmJ4LiHICjg uJvguKPguLDguYDguJfguKjguYTguJfguKIpIOC4iOC4s+C4geC4seC4lDCCASIwDQYJKoZIhvcN AQEBBQADggEPADCCAQoCggEBALvecvnwT8SRovlbCuX6rac9HMQVzaRy2MvlHSmUrB97/EH59gu5 NygpkN7E5GYjSsxJsmfu63qybVonBN5o8DTLFAodRqEVp5R6ohmxtG34kMzAPu4lXPjcDZcRv/na w5IYUNFZjjCFQYkMP1a9CIQ59U3rMMEeoA8+KTsbjlgXgEI4y7wyYPhUmmIqH/VxS2Qj6M+rrwW5 vc5IpgX/gTvB0C24e6VEvstFSRuVOuznk9N2dyH9AEXNwHEu2yCkn8eDQO1WPJwLrKByj0WhU1dX CgTS6f64jjLPE1G2afq/5HWQvvWi9vQgfGhPfadPaMuAxWYovCmOgx/nWqvOMpcCAwEAAaOCAngw ggJ0MIGQBggrBgEFBQcBAQSBgzCBgDBHBggrBgEFBQcwAoY7aHR0cDovL3d3dy50aGFpZGlnaXRh bGlkLmNvbS9kb3dubG9hZC9jZXJ0L1RESUQlMjBDQS1HMy5jZXIwNQYIKwYBBQUHMAGGKWh0dHA6 Ly93d3cudGhhaWRpZ2l0YWxpZC5jb20vdGRpZGNhZzNvY3NwMB0GA1UdDgQWBBTnwPnm2S4yCyrW Yrbf6fNV04oJmjAMBgNVHRMBAf8EAjAAMB8GA1UdIwQYMBaAFEd8C0sQF+J9gJHVwUCqUwsoty9I MBcGA1UdIAQQMA4wDAYKYIV8AQECAc4RATCB/gYDVR0fBIH2MIHzMIHwoIGQoIGNhoGKaHR0cDov L3d3dy50aGFpZGlnaXRhbGlkLmNvbS90ZGlkY2FnM2NybC9jZXJ0ZGlzdD9jbWQ9Y3JsJmlzc3Vl cj1DTiUzZFRoYWkrRGlnaXRhbCtJRCtDQStHMyUyY08lM2RUaGFpK0RpZ2l0YWwrSUQrQ29tcGFu eStMaW1pdGVkJTJjQyUzZFRIolukWTBXMR4wHAYDVQQDDBVUaGFpIERpZ2l0YWwgSUQgQ0EgRzMx KDAmBgNVBAoMH1RoYWkgRGlnaXRhbCBJRCBDb21wYW55IExpbWl0ZWQxCzAJBgNVBAYTAlRIMA4G A1UdDwEB/wQEAwIF4DBnBgNVHREEYDBegRhKbmFzb21ib29uQHRhY2hpLXMuY28udGikQjBAMT4w PAYDVQQDDDVUYWNoaS1TIEF1dG9tb3RpdmUgU2VhdGluZyAoVGhhaWxhbmQpIENvbXBhbnkgTGlt aXRlZDANBgkqhkiG9w0BAQsFAAOCAgEAM+cML3fv5bjw1OMjFZlVtNFjA5PbI8kVECFsPiu0Q9Zm rpsUBaiqg5ag4IClQYW8BNpMmMBpJUpSm7QnC2LUxGQcLdkjM0UOsipcZE5QGt9/kSxL3EJFiebP cUBgGylWhYqs86yXDQ4M34zQC5XFuc4APEUFU4WsBlNPeUPz8gQxhDLvho4ffa18ZsPdgaoPjEs4 AmcO4D54m22c7hu03R46bOMX0mCJNrz9nEL9zIcwVZY1PE6snFOFBSqFLiiNK/SDqphZglW/6sQc uVIAAhWb0Rck9tDcxxWDj2eZJDkSmGS4nZL1M3140Oo5ymKyL1rpfCGZHxQPbg6fcZxl82mEkJdd Bt+/GW/0XKlTgBwaiszD6CjzASy2b8/wfHJuAFhVOnNaU7fAfvqnEBX+d5fT4t3ZTYNR6KocPNKg johh+tdbCAcUYLO3u4MNMF0VzzIQnSC/pXcZTD51rZ0KYLjGKNGiKan7o8Hgodwp+W65nw4mkQKn VQWnLoCZOPFotWiQ8+KHDX+Q8wwDeNAoyJVbySycDF4JVgsah1B6ehC3POtCb4oU26n/1vbe/EA4 tx44tCA+iqJ2KqM1zQuJG5NOcS2ZuHquuPm7kBgnOsCEeInqSIwywysbw5tSfXiZfrU9xVaUbyjx 87GYc8GdP1gxgS5QnFFxt83oAtnQz7c=";

            return signedXml.Sign(               // Signing document
                algorithm,                              // algorithm
                keys.privateKey,                        // key
                xmlDoc,                                 // document
                {                                       // options
                    keyValue: keys.publicKey,
                    id: "xmldsig-73d655e5-f5b9-4259-8e89-896c3369aade",
                    x509: [cert],
                    signingCertificate: cert,
                    references: [
                        {   hash: "SHA-256", 
                            transforms: [
                                "enveloped",
                            ], 
                            id: "xmldsig-73d655e5-f5b9-4259-8e89-896c3369aade-ref0", 
                            // uri: "xmldsig-73d655e5-f5b9-4259-8e89-896c3369aade-ref0", 
                        },
                    ],
                    signerRole: {
                        claimed: ["Some role"]
                    }
                }
            )
        }
    ).then(signature => signature.toString());
    
}
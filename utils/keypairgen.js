const fs = require("fs");
const crypto = require("crypto");

function generateRSAKeys(publicKeyPath, privateKeyPath) {
  let publicKey, privateKey;

  if (fs.existsSync(publicKeyPath) && fs.existsSync(privateKeyPath)) {
    publicKey = fs.readFileSync(publicKeyPath);
    privateKey = fs.readFileSync(privateKeyPath);
  } else {
    try {
      const keyPair = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096, // key size
        publicKeyEncoding: {
          type: "spki", // SubjectPublicKeyInfo (OpenSSL-compatible)
          format: "pem", // Base64-encoded PEM format
        },
        privateKeyEncoding: {
          type: "pkcs8", // Private Key Info (OpenSSL-compatible)
          format: "pem", // Base64-encoded PEM format
        },
      });

      publicKey = keyPair.publicKey;
      privateKey = keyPair.privateKey;

      fs.writeFileSync(publicKeyPath, publicKey);
      fs.writeFileSync(privateKeyPath, privateKey);
    } catch (error) {
      throw error;
    }
  }

  return { publicKey, privateKey };
}

module.exports = {
  generateRSAKeys,
};

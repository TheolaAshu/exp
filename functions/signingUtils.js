const crypto = require('crypto');


function convertToHash(signature) {
  const hashFunction = "sha256"; // Choose the hashing function to use
  const hash = crypto.createHash(hashFunction);
  hash.update(signature);
  return hash.digest("hex");
}

// Helper function to download a PDF from a URL
function downloadPdf(pdfUrl) {
  return new Promise((resolve, reject) => {
    request.get(pdfUrl, { encoding: null }, (error, response, body) => {
      if (error) {
        reject("Download failed : " + error);
      } else if (response.statusCode !== 200) {
        reject(new Error(`Failed to download PDF: ${response.statusCode}`));
      } else {
        resolve(body);
      }
    });
  });
}

// Helper function to generate a digital signature for a PDF
function generateSignature(pdfBuffer, privateKeyString) {
  const privateKey = crypto.createPrivateKey(privateKeyString);
  const signer = crypto.createSign("SHA256");
  signer.update(pdfBuffer);
  return signer.sign(privateKey);
}

module.exports = {
  generateSignature,
  downloadPdf,
  convertToHash,
};

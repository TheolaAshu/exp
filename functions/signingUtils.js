const crypto = require("crypto");
const { generateRSAKeys } = require("../utils/keypairgen");
const path = require("path");
const pdfLib = require("pdf-lib");
const PDFDocument = require("pdfkit");
const { Readable } = require("stream");

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
// function generateSignature(pdfBuffer, privateKeyString) {
//   const privateKey = crypto.createPrivateKey(privateKeyString);
//   const signer = crypto.createSign("SHA256");
//   signer.update(pdfBuffer);
//   return signer.sign(privateKey);
// }

async function generateSignature(pdfBuffer, userId) {
  const publicKeyPath = path.join(
    __dirname,
    "..",
    "key-pairs",
    `${userId}-public.pem`
  );
  const privateKeyPath = path.join(
    __dirname,
    "..",
    "key-pairs",
    `${userId}-private.pem`
  );

  try {
    if (!pdfBuffer) {
      throw new Error("pdfBuffer is undefined");
    }

    const { publicKey, privateKey } = generateRSAKeys(
      publicKeyPath,
      privateKeyPath
    );

    const signer = crypto.createSign("SHA256");
    signer.update(pdfBuffer);
    const signature = signer.sign(privateKey);

    const verifier = crypto.createVerify("SHA256");
    verifier.update(pdfBuffer);
    const isSignatureValid = verifier.verify(publicKey, signature);

    if (!isSignatureValid) {
      throw new Error("Invalid signature");
    }

    return { signature, signedPdfBuffer: pdfBuffer };
  } catch (error) {
    return { error };
  }
}

function verifySignature(pdfBuffer, userId) {
  const publicKeyPath = path.join(
    __dirname,
    "..",
    "key-pairs",
    `${userId}-public.pem`
  );
  try {
    const publicKeyData = fs.readFileSync(publicKeyPath);
    const publicKey = crypto.createPublicKey(publicKeyData);

    const verifier = crypto.createVerify("SHA256");
    verifier.update(pdfBuffer);

    const isSignatureValid = verifier.verify(publicKey, pdfBuffer);

    return isSignatureValid;
  } catch (error) {
    console.error(error);
    return false;
  }
}

module.exports = {
  generateSignature,
  downloadPdf,
  convertToHash,
  verifySignature,
};

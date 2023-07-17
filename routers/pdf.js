const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const pdfLib = require("pdf-lib");
const multer = require("multer");
const upload = multer();

const {
  downloadPdf,
  generateSignature,
  convertToHash,
  verifySignature,
} = require("../functions/signingUtils");
const {
  uploadPdfToFirebase,
  updateDocument,
} = require("../functions/firebase");
// Use body-parser middleware to parse JSON request bodies
router.use(bodyParser.json());

// Route to sign a PDF from a URL

router.post("/sign", upload.single("pdfFile"), async (req, res) => {
  try {
    const pdfBuffer = req.file.buffer;
    const userId = req.body.user; // assuming the user ID is available in the request


    // Generate a digital signature using the private key
    const result = await generateSignature(pdfBuffer, userId);

    //code to convert signature to a hash using a hashing function
    const hash = convertToHash(result.signature);

    const newBuffer = result.signedPdfBuffer

    const pdfDoc = await pdfLib.PDFDocument.load(newBuffer);


    pdfDoc.setSubject(hash);


    console.log(result);

    const pdfUrl = await uploadPdfToFirebase(
      newBuffer,
      `${userId}-${req.file.originalname}`
    );

    // Update the user's document with the PDF URL
    console.log(userId);
    const updated = await updateDocument("users", userId, { pdfUrl });

    if (!updated) {
      return res.send({ error: "Could not update use" });
    }

    // Return the unsigned PDF URL and hash
    res.send({ url: pdfUrl, hash });
  } catch (error) {
    console.error("Error signing PDF:", error);
    res.status(500).send("Internal server error");
  }
});

// Route to get the hash of a PDF from a file
router.post("/get-hash", upload.single("pdfFile"), async (req, res) => {
  try {
    const pdfBuffer = req.file.buffer;
    const userId = req.body.user;

    // Load the PDF into pdf-lib
    const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);

    // Extract the hash from the PDF metadata
    const hash = pdfDoc.getSubject();


    const result = await verifySignature(pdfBuffer, userId);

    console.log(result);


    res.send({ hash });
  } catch (error) {
    console.error("Error getting PDF hash:", error);
    res.status(500).send("Internal server error");
  }
});

// Route to verify a signed PDF
router.post("/verify", async (req, res) => {
  try {
    const pdfUrl = req.body.pdfUrl;
    const hash = req.body.hash;

    // Download the signed PDF from the URL
    const pdfBuffer = await downloadPdf(pdfUrl);

    // Load the PDF into pdf-lib
    const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);

    // Verify the hash in the PDF metadata matches the input hash
    const pdfHash = pdfDoc.getSubject();
    if (pdfHash !== hash) {
      throw new Error("PDF hash does not match input hash");
    }

    // Verify the digital signature using the public key
    const publicKey = publicKeyString;
    const signature = extractSignature(pdfBuffer);
    const verified = verifySignature(signature, pdfBuffer, publicKey);
    if (!verified) {
      throw new Error("PDF signature is not valid");
    }

    res.send({ verified: true });
  } catch (error) {
    console.error("Error verifying PDF:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;

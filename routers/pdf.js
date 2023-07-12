const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const pdfLib = require("pdf-lib");
const request = require("request");

const { downloadPdf, generateSignature, convertToHash } = require("../functions/signingUtils");
const { privateKeyString } = require("../utils/key");
const { uploadSignedPdf } = require("../functions/uploadPdf");
// Use body-parser middleware to parse JSON request bodies
router.use(bodyParser.json());

// Route to sign a PDF from a URL
router.get("/sign", async (req, res) => {
  try {
    const pdfUrl = req.query.pdfUrl;
    const privateKey = privateKeyString;

    console.log("downloading...");
    // Download the PDF from the URL
    const pdfBuffer = await downloadPdf(pdfUrl);

    console.log("downloaded");
    // Load the PDF into pdf-lib
    const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);

    // Generate a digital signature using the private key
    const signature = generateSignature(pdfBuffer, privateKey);

    //code to convert signature to a hash using a hashing function
    const hash = convertToHash(signature);

    pdfDoc.setSubject(hash);

    // Return the signed PDF as a binary response
    const signedPdfBuffer = await pdfDoc.save();

    const url = await uploadSignedPdf(signedPdfBuffer, "files/teola-file.pdf");
    res.send({ url: url ?? "no url found", hash });
  } catch (error) {
    console.error("error heyyy", error);
    res.status(500).send("Internal server error");
  }
});

// Route to sign a PDF from a URL
router.get("/get-hash", async (req, res) => {
  try {
    const pdfUrl = req.query.pdfUrl;

    console.log("downloading...");
    // Download the PDF from the URL
    const pdfBuffer = await downloadPdf(pdfUrl);

    console.log("downloaded");
    // Load the PDF into pdf-lib
    const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);

    const hash = pdfDoc.getSubject();

    res.send({ hash });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;

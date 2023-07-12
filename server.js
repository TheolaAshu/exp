const express = require('express')
const cors = require('cors')
const {  upload } = require('./functions/saveFile')
const app =express()
const pdfLib = require('pdf-lib');
const crypto = require('crypto');
const request = require('request');
const { uploadSignedPdf } = require('./functions/uploadPdf');
const port = 5000
const {privateKeyString} = require('./utils/key')

app.use(cors())


// Route to sign a PDF from a URL
app.get('/sign-pdf', async (req, res) => {
  
  try {
    const pdfUrl = req.query.pdfUrl;
    const privateKey = privateKeyString;

    console.log('downloading...')
    // Download the PDF from the URL
    const pdfBuffer = await downloadPdf(pdfUrl);

    console.log('downloaded')
    // Load the PDF into pdf-lib
    const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);

    // Generate a digital signature using the private key
    const signature = generateSignature(pdfBuffer, privateKey);


    //code to convert signature to a hash using a hashing function
      const hash = convertToHash(signature);
    
       pdfDoc.setSubject(hash);

    // Return the signed PDF as a binary response
    const signedPdfBuffer = await pdfDoc.save();
    
    
    const url = await uploadSignedPdf(signedPdfBuffer, 'files/teola-file.pdf')
    res.send({url:url??"no url found", hash});
  } catch (error) {
    console.error("error heyyy",error);
    res.status(500).send('Internal server error');
  }
});

// Route to sign a PDF from a URL
app.get('/get-hash', async (req, res) => {
  
  try {
    const pdfUrl = req.query.pdfUrl;

    console.log('downloading...')
    // Download the PDF from the URL
    const pdfBuffer = await downloadPdf(pdfUrl);

    console.log('downloaded')
    // Load the PDF into pdf-lib
    const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);

    const hash = pdfDoc.getSubject()

    res.send({hash})

  }catch(err){
    res.status(500).send(err)
  }

})


function convertToHash(signature) {
  const hashFunction = 'sha256'; // Choose the hashing function to use
  const hash = crypto.createHash(hashFunction);
  hash.update(signature);
  return hash.digest('hex');
}

// Helper function to download a PDF from a URL
function downloadPdf(pdfUrl) {
  return new Promise((resolve, reject) => {
    request.get(pdfUrl, { encoding: null }, (error, response, body) => {
      if (error) {
        reject("Download failed : "+error);
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
  const signer = crypto.createSign('SHA256');
  signer.update(pdfBuffer);
  return signer.sign(privateKey);
}

// Start the ExpressJS application
app.listen(port, () => {
  console.log('Server started on port '+port);
});





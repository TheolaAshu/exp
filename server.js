const express = require('express')
const cors = require('cors')
const {  upload } = require('./functions/saveFile')
const app =express()
const pdfLib = require('pdf-lib');
const crypto = require('crypto');
const request = require('request');
const { uploadSignedPdf } = require('./functions/uploadPdf');
const port = 5000

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





const privateKeyString=`-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAmEUPGQsObLvFyvGPIBMJOyL3ZXp6btx/2kZGt5IXcrxUpZEI
tZQ49TSHs2AwDSTk3ljcMralvfpF4NbQtrua80a+jcaXRAnL0vEDD8hzkvLmyt94
Mb/F1rGkfMwq93EXGamJYnt1BKx0xdRGisjHIundlo1DTEImWwQp/rO1uV+Mek1N
YoDNg9sREowvAIh2JzKTJJowUjv/ABtuZl663vIZ7AQXxhW5PMsN92H7gim4tPqJ
i06mKQfGhMGVZCNS8TwUgPIYuRt6pZRLztOWozjnLr9sAvpfDL0dkqsQ6jMUv//s
4oH286aGt9vvuAP9VlcSefi2Wo0m1bs7dQCh9QIDAQABAoIBACHysZtEfQaOdZpZ
sS52OAZkdRI9lHrPc7zDEsSeEFa++MNB+tZa0bkPaVq7TPM9QL52wr8WvAyHNhma
4wT+fh0Tbmv29OYRJg1lOOjFqMjAGWbtHCPBTPcg+1psfX7Vyo/o3a2kdzIfzdgG
S+TovwcAa2wDmhewHtOHceJsiA0oEYG4X7SF36YmiGJtya5VRtcTj4+LpNv39PAV
qN4pJXviecW6nq+sbfQ57QoHtUFcl3qupm8oaRzN6PlrQHomzEa6xxNUMduchDYc
B3tUnZV9kpSIRVF7uTxibh3Y+FPv1wmj1ZnJn0Z2HoKqk3npLTR0su1nPtEnFl2H
Ryap6xkCgYEAyNyvqZ1fUd1ubdhd8e93ygq8dFui0tkCbsZv+4GbpWucViqrQxdK
oPx5HBLv3bMNc+Jp3Bkus4GI3O41dBvrsQDAwisYnqlEKkDWBoubK0i5LlC1How5
+qKvUC0zlr8UuqKRkIbC26werYC0yawbPl0hs2Qh85RvaHYbgMZvz60CgYEAwhGd
LT53B4fq5VesfJqAwzt87dWm7vWe+Z/+WVsbDYxR/9SPdSQypP0AzBryz2FsqmKv
JOEbuZpb8wWIcHgDcsOoiG7kBEKZ0t5KCUzfY6EfTwFSJQfBwmgkKKX2o8TJI+tV
MCEnOhRVHz7IHRScI42p17a/FQJhZlIsnEM0xGkCgYBCCeSrRHVxafcDoG6Ku6vL
vqnlK7el0PluyElLDHrK8U1uOwshvMeplDiRVVyNrG/Q2PDrD1B+bik8Ugk7Cm78
O/4kGJ04lPg3WCfF8SJsIbXYl2plB7+MOu6e0q2yc1JyZj6roNLx/G39p2JJKA+w
+le5LkPHXNcgJiy2swdR5QKBgH5B0V0XD39hyMtOX9Rs/CqH8D4XStSaDcRfd62Q
nSgSS2LCWlaepyg5xaQEQEX1Hyo2q7W1kkENEJcp2Vs6aRvn+SRR6Jxw6/yJS+eD
EK6Tq3fN5zBaPI+LC0M6vhxLsYRh3XlDiG67valnQe/RccebqYzCwswbUVytR4Ke
Ip1JAoGAX7LdLEXHqanMr8wfbuMO3Xrg/smdNZPOikTe37c+M/wsHDR9H4Avmglr
6Zw6dNbLyYz6RSFdW6fIO0/EcZU631Q5nBrmQ49J9baSynAK3gtOtm9tf1BFgsQD
ciZl0utGG9TVHoi/OngWKZqxTiw3Ce8Ze3vlX74fkuc1CZED5Gc=
-----END RSA PRIVATE KEY-----
`

const { getStorage, ref, uploadBytes, getDownloadURL } =  require("firebase/storage");
const { firebaseApp } = require("./firebase");


// Upload a signed PDF to Firebase Storage
async function uploadSignedPdf(pdfBuffer, filePath) {
    const storage = getStorage(firebaseApp);
  
    // Create a reference to the file in Firebase Storage
    const fileRef = ref(storage, filePath);
  
    // Upload the signed PDF to Firebase Storage
    const metadata = { contentType: 'application/pdf' };
    await uploadBytes(fileRef, pdfBuffer, metadata);
    const url = await getDownloadURL(fileRef)

    return url;
  
    console.log(`Signed PDF uploaded to ${filePath}`);
  }



  module.exports = {uploadSignedPdf}
// Import the required Firebase libraries
const admin = require("firebase-admin");
const serviceAccount = require("../utils/serviceAccount.json");

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("======= Firebase Initialized ========");

// Create a Firebase Authentication instance
const auth = admin.auth();

// Create a Firestore instance
const db = admin.firestore();

// create a firebase storage instance
const storage = admin.storage();

const bucketName = "t-scripty.appspot.com";

// Define utility functions for authentication, registration, and login

// Register a new user with the specified email, password, and profile data
async function registerUser(email, password, profileData) {
  try {
    // Create the user in Firebase Authentication
    const userRecord = await auth.createUser({
      email: email,
      password: password,
    });

    // Add the profile data to Firestore
    const userId = userRecord.uid;
    await db.collection("users").doc(userId).set(profileData);

    // Return the user ID
    return userId;
  } catch (error) {
    // console.error("Error registering user: ", error);
    if (error.code === "auth/email-already-exists") {
      // Handle the case when a user with the same email already exists
      console.error("Error: Email already exists");
      return { error: "Email already exists" };
    } else {
      // Handle other errors
      console.error("Unexpected error: ", error);
    }
    return null;
  }
}

// Authenticate a user with the specified email and password
async function authenticateUser(email, password) {
  console.log("=====> Loggin In");
  try {
    // Authenticate the user in Firebase Authentication
    // Authenticate the user in Firebase Authentication
    const signInResult = await auth.getUserByEmail(email);
    const userId = signInResult.uid;

    // console.log(signInResult);
    // console.log(userId)
    // const signInResult = await auth.signInWithCustomToken(token);

    // Get the user profile data from Firestore
    const userProfileRef = await db.collection("users").doc(userId).get();
    let userProfileData = userProfileRef.data();
    userProfileData.id = userId;

    const token = await auth.createCustomToken(userId);

    // Return the access token and user profile data
    // const accessToken = signInResult.user.getIdToken();
    return {
      accessToken: token,
      userProfileData: userProfileData,
    };
  } catch (error) {
    console.error("Error authenticating user: ", error);
    if (error.code === "auth/user-not-found") {
      return {
        error: "User not found",
      };
    }
    if (error.code === "auth/invalid-emai") {
      return {
        error: error.message,
      };
    }
    return null;
  }
}

// =============================== Define utility functions for CRUD operations ========================================

// Create a new document in the specified collection
async function createDocument(collectionName, documentData) {
  try {
    const docRef = await db.collection(collectionName).add(documentData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating document: ", error);
    return null;
  }
}

// Read a document with the specified ID from the specified collection
async function readDocument(collectionName, documentId) {
  try {
    const docRef = await db.collection(collectionName).doc(documentId).get();
    if (docRef.exists) {
      return docRef.data();
    } else {
      console.error("Document not found");
      return null;
    }
  } catch (error) {
    console.error("Error reading document: ", error);
    return null;
  }
}

// Update a document with the specified ID in the specified collection
async function updateDocument(collectionName, documentId, documentData) {
  try {
    await db.collection(collectionName).doc(documentId).update(documentData);
    return true;
  } catch (error) {
    console.error("Error updating document: ", error);
    return false;
  }
}

// Delete a document with the specified ID from the specified collection
async function deleteDocument(collectionName, documentId) {
  try {
    await db.collection(collectionName).doc(documentId).delete();
    return true;
  } catch (error) {
    console.error("Error deleting document: ", error);
    return false;
  }
}

// Define a middleware function to authenticate Firebase Authentication tokens
async function authenticateToken(req, res, next) {
  try {
    console.log(req.headers.authorization);
    const authToken = req.headers.authorization.split(" ")[1];
    const decodedToken = await auth.signInWithCustomToken(authToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error authenticating token: ", error);
    res.status(401).json({ error: "Unauthorized" });
  }
}
function buildDownloadUrl(filePath) {
  const bucket = storage.bucket(bucketName);
  const bucketUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}`;
  const fileUrl = `${bucketUrl}/o/${encodeURIComponent(filePath)}?alt=media`;
  return fileUrl;
}
async function uploadPdfToFirebase(pdfBuffer, fileName) {
  configureBucketCors().catch(console.error);
  const bucket = storage.bucket(bucketName);

  const getbucketName = bucket.name;

  console.log(`The default Firebase Storage bucket name is ${getbucketName}.`);

  const file = bucket.file(`transcripts/${fileName}`);

  await file.save(pdfBuffer, {
    metadata: { contentType: "application/pdf" },
    public: true,
    validation: "md5",
  });

  // const [url] = await file.getSignedUrl({
  //   action: "read",
  //   expires: "03-17-2025", // Set the URL expiration date
  // });

  const url = buildDownloadUrl(`transcripts/${fileName}`);

  return url;
}

async function configureBucketCors() {
  const origin = "http://localhost:3000";
  const responseHeader = "Content-Type";
  const maxAgeSeconds = 3600;
  const method = "GET";
  await storage.bucket(bucketName).setCorsConfiguration([
    {
      maxAgeSeconds,
      method: [method],
      origin: [origin],
      responseHeader: [responseHeader],
    },
  ]);

  console.log(`Bucket ${bucketName} was updated with a CORS config
      to allow ${method} requests from ${origin} sharing 
      ${responseHeader} responses across origins`);
}

async function getAllUsersByRole(role) {
  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("role", "==", role).get();
    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Failed to get all users by role:", error);
    throw new Error("Failed to get all users by role");
  }
}

// Export the utility functions
module.exports = {
  registerUser,
  authenticateUser,
  createDocument,
  readDocument,
  updateDocument,
  deleteDocument,
  authenticateToken,
  uploadPdfToFirebase,
  getAllUsersByRole,
};

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
    console.error("Error registering user: ", error);
    return null;
  }
}

// Authenticate a user with the specified email and password
async function authenticateUser(email, password) {
  try {
    // Authenticate the user in Firebase Authentication
    const userRecord = await auth.getUserByEmail(email);
    const userId = userRecord.uid;
    const token = await auth.createCustomToken(userId);
    const signInResult = await auth.signInWithCustomToken(token);

    // Get the user profile data from Firestore
    const userProfileRef = await db.collection("users").doc(userId).get();
    const userProfileData = userProfileRef.data();

    // Return the access token and user profile data
    const accessToken = signInResult.user.getIdToken();
    return {
      accessToken: accessToken,
      userProfileData: userProfileData,
    };
  } catch (error) {
    console.error("Error authenticating user: ", error);
    return null;
  }
}

// Define utility functions for CRUD operations

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

// Export the utility functions
module.exports = {
  registerUser,
  authenticateUser,
  createDocument,
  readDocument,
  updateDocument,
  deleteDocument,
};

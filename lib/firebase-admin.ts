import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as serviceAccount from "../service-account.json";

// Initialize Firebase
const app = initializeApp({
  credential: cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key.replace(/\\n/g, '\n')
  })
});

// Initialize Firestore
const db = getFirestore(app);

export { db as adminDb }; // Critical change - renamed export

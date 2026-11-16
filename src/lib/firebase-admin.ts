import {
  cert,
  getApps,
  initializeApp,
  type App,
  applicationDefault,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

export class FirebaseAdminConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FirebaseAdminConfigError";
  }
}

function initAdminApp(): App {
  if (getApps().length) return getApps()[0]!;

  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    process.env.GCLOUD_PROJECT ??
    process.env.GOOGLE_CLOUD_PROJECT ??
    "hekomimoto";

  const storageBucket =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    `${projectId}.firebasestorage.app`;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      const serviceAccount = JSON.parse(json) as {
        project_id?: string;
        client_email: string;
        private_key: string;
      };
      return initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id ?? projectId,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
        }),
        storageBucket,
        projectId,
      });
    } catch {
      throw new FirebaseAdminConfigError(
        "FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON.",
      );
    }
  }

  // Local/dev without a key: fail with a clear message instead of ADC noise.
  if (process.env.NODE_ENV !== "production") {
    throw new FirebaseAdminConfigError(
      "Missing FIREBASE_SERVICE_ACCOUNT_JSON in .env.local. Create a Firebase service account key and paste the JSON as one line.",
    );
  }

  try {
    return initializeApp({
      credential: applicationDefault(),
      storageBucket,
      projectId,
    });
  } catch {
    throw new FirebaseAdminConfigError(
      "Firebase Admin credentials unavailable. Set FIREBASE_SERVICE_ACCOUNT_JSON or enable Application Default Credentials.",
    );
  }
}

export function getAdminDb() {
  return getFirestore(initAdminApp());
}

export function getAdminBucket() {
  return getStorage(initAdminApp()).bucket();
}

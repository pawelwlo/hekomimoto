import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
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

type ServiceAccountJson = {
  project_id?: string;
  client_email: string;
  private_key: string;
};

function initFromServiceAccount(
  serviceAccount: ServiceAccountJson,
  projectId: string,
  storageBucket: string,
) {
  return initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id ?? projectId,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
    }),
    storageBucket,
    projectId,
  });
}

function loadServiceAccountFromEnv(): ServiceAccountJson | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      return JSON.parse(json) as ServiceAccountJson;
    } catch {
      throw new FirebaseAdminConfigError(
        "FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON.",
      );
    }
  }

  const pathHint =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!pathHint) return null;

  const filePath = resolve(process.cwd(), pathHint);
  if (!existsSync(filePath)) {
    throw new FirebaseAdminConfigError(
      `Service account file not found: ${filePath}`,
    );
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as ServiceAccountJson;
  } catch {
    throw new FirebaseAdminConfigError(
      `Could not read service account file: ${filePath}`,
    );
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
    process.env.FIREBASE_STORAGE_BUCKET ??
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    `${projectId}.firebasestorage.app`;

  const serviceAccount = loadServiceAccountFromEnv();
  if (serviceAccount) {
    return initFromServiceAccount(serviceAccount, projectId, storageBucket);
  }

  if (process.env.NODE_ENV !== "production") {
    throw new FirebaseAdminConfigError(
      "Missing Firebase Admin credentials. Download a service account key, save it as service-account.json in the project root, then add FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json to .env.local (or paste FIREBASE_SERVICE_ACCOUNT_JSON as one line).",
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
      "Firebase Admin credentials unavailable. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON.",
    );
  }
}

export function getAdminDb() {
  return getFirestore(initAdminApp());
}

export function getAdminBucket() {
  return getStorage(initAdminApp()).bucket();
}

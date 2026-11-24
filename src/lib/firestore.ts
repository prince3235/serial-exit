import { Firestore } from "@google-cloud/firestore";

/**
 * Lazily-created Firestore client (server only).
 *
 * Auth: on Cloud Run this uses the service's runtime service account via
 * Application Default Credentials — no key files, no secrets in the image.
 * Locally, either run the emulator (FIRESTORE_EMULATOR_HOST is picked up
 * automatically) or `gcloud auth application-default login`.
 *
 * The client is created on first use so that `next build` never needs
 * credentials.
 */
let client: Firestore | null = null;

export function getFirestore(): Firestore {
  if (!client) {
    client = new Firestore({
      ignoreUndefinedProperties: true,
      // Optional: use a named database instead of "(default)".
      ...(process.env.FIRESTORE_DATABASE_ID ? { databaseId: process.env.FIRESTORE_DATABASE_ID } : {}),
    });
  }
  return client;
}

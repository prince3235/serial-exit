import { Firestore } from "@google-cloud/firestore";

/**
 * Lazily-created Firestore client (server only).
 *
 * Credential resolution order:
 *  1. FIRESTORE_EMULATOR_HOST (local emulator)
 *  2. GOOGLE_SERVICE_ACCOUNT_JSON (raw JSON or base64-encoded service account key — Vercel/Docker)
 *  3. FIREBASE_PROJECT_ID / GOOGLE_CLOUD_PROJECT + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *  4. Application Default Credentials (Cloud Run / gcloud ADC)
 *
 * The client is created on first use so `next build` never needs credentials.
 */
let client: Firestore | null = null;

type ServiceAccount = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

export function parseGoogleServiceAccount(): ServiceAccount | null {
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (rawJson) {
    try {
      const decoded = rawJson.startsWith("{")
        ? rawJson
        : Buffer.from(rawJson, "base64").toString("utf8");
      const parsed = JSON.parse(decoded) as ServiceAccount;
      if (parsed.client_email && parsed.private_key) {
        return {
          ...parsed,
          private_key: parsed.private_key.replace(/\\n/g, "\n"),
        };
      }
    } catch (err) {
      console.error("[firestore] Invalid GOOGLE_SERVICE_ACCOUNT_JSON", err);
    }
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  const projectId =
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim();

  if (clientEmail && privateKey) {
    return {
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, "\n"),
    };
  }
  return null;
}

export function isFirestoreExplicitlyConfigured(): boolean {
  return Boolean(
    process.env.FIRESTORE_EMULATOR_HOST ||
      parseGoogleServiceAccount() ||
      process.env.K_SERVICE || // Cloud Run runtime (ADC)
      process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
}

export function getFirestore(): Firestore {
  if (!client) {
    const sa = parseGoogleServiceAccount();
    const projectId =
      sa?.project_id ||
      process.env.FIREBASE_PROJECT_ID?.trim() ||
      process.env.GOOGLE_CLOUD_PROJECT?.trim();

    client = new Firestore({
      ignoreUndefinedProperties: true,
      ...(projectId ? { projectId } : {}),
      ...(sa?.client_email && sa?.private_key
        ? {
            credentials: {
              client_email: sa.client_email,
              private_key: sa.private_key,
            },
          }
        : {}),
      ...(process.env.FIRESTORE_DATABASE_ID
        ? { databaseId: process.env.FIRESTORE_DATABASE_ID }
        : {}),
    });
  }
  return client;
}

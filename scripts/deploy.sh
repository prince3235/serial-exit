#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# One-command deploy: Cloud Build → Cloud Run → Firebase Hosting (CDN + custom domain).
#
#   PROJECT_ID=my-project SITE_URL=https://www.example.com npm run deploy
#
# Prerequisites: gcloud CLI + firebase CLI installed and logged in
# (`gcloud auth login`, `firebase login`). See docs/DEPLOYMENT.md.
#
# Optional secrets (create once in Secret Manager; this script wires them in if they exist):
#   portal-access-key, resend-api-key
# ---------------------------------------------------------------------------
set -euo pipefail

PROJECT_ID="${PROJECT_ID:?Set PROJECT_ID to your Google Cloud / Firebase project id}"
SITE_URL="${SITE_URL:?Set SITE_URL to the final public URL, e.g. https://www.example.com}"
REGION="${REGION:-asia-south1}"           # Mumbai — closest to Indian users
SERVICE="${SERVICE:-serial-exit}"          # must match firebase.json -> rewrites[].run.serviceId
REPO="${REPO:-serial-exit}"
MIN_INSTANCES="${MIN_INSTANCES:-0}"        # set to 1 to remove cold starts (small monthly cost)
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${SERVICE}:$(date +%Y%m%d-%H%M%S)"

echo "▶ Project: $PROJECT_ID  Region: $REGION  Service: $SERVICE  Site: $SITE_URL"
gcloud config set project "$PROJECT_ID" >/dev/null

echo "▶ Enabling APIs (idempotent)…"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com \
  firestore.googleapis.com secretmanager.googleapis.com firebasehosting.googleapis.com

echo "▶ Ensuring Artifact Registry repo…"
gcloud artifacts repositories describe "$REPO" --location "$REGION" >/dev/null 2>&1 || \
  gcloud artifacts repositories create "$REPO" --repository-format=docker --location "$REGION"

echo "▶ Ensuring Firestore database (Native mode)…"
gcloud firestore databases describe >/dev/null 2>&1 || \
  gcloud firestore databases create --location="$REGION" || echo "  (Firestore create skipped/failed — check the console)"

echo "▶ Building image with Cloud Build…"
gcloud builds submit --config cloudbuild.yaml \
  --substitutions="_IMAGE=${IMAGE},_SITE_URL=${SITE_URL},_POSTHOG_KEY=${NEXT_PUBLIC_POSTHOG_KEY:-},_POSTHOG_HOST=${NEXT_PUBLIC_POSTHOG_HOST:-},_GSC_TOKEN=${NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION:-}" .

# Wire in secrets only if they exist.
SECRET_ARGS=()
for pair in "PORTAL_ACCESS_KEY=portal-access-key" "RESEND_API_KEY=resend-api-key"; do
  env_name="${pair%%=*}"; secret="${pair##*=}"
  if gcloud secrets describe "$secret" >/dev/null 2>&1; then
    SECRET_ARGS+=("${env_name}=${secret}:latest")
  else
    echo "  ℹ secret '$secret' not found — $env_name will be unset (portal stays locked / email forwarding off)"
  fi
done
SECRETS_FLAG=()
if [ ${#SECRET_ARGS[@]} -gt 0 ]; then
  SECRETS_FLAG=(--set-secrets "$(IFS=,; echo "${SECRET_ARGS[*]}")")
fi

echo "▶ Deploying to Cloud Run…"
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" --region "$REGION" --platform managed \
  --allow-unauthenticated \
  --port 8080 --cpu 1 --memory 512Mi --concurrency 80 \
  --min-instances "$MIN_INSTANCES" --max-instances 10 \
  --set-env-vars "NEXT_PUBLIC_SITE_URL=${SITE_URL},CONTACT_NOTIFY_EMAIL=${CONTACT_NOTIFY_EMAIL:-partners@serialexit.com}" \
  ${SECRETS_FLAG[@]+"${SECRETS_FLAG[@]}"}

echo "▶ Granting the Cloud Run service account Firestore write access…"
RUN_SA="$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(spec.template.spec.serviceAccountName)')"
if [ -z "$RUN_SA" ]; then
  PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
  RUN_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
fi
gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:${RUN_SA}" \
  --role="roles/datastore.user" --condition=None >/dev/null
for s in portal-access-key resend-api-key; do
  gcloud secrets describe "$s" >/dev/null 2>&1 && gcloud secrets add-iam-policy-binding "$s" \
    --member="serviceAccount:${RUN_SA}" --role="roles/secretmanager.secretAccessor" >/dev/null || true
done

echo "▶ Deploying Firebase Hosting (+ Firestore rules)…"
mkdir -p firebase-public
firebase deploy --only hosting,firestore:rules --project "$PROJECT_ID"

echo "✔ Done. Cloud Run URL:"
gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)'
echo "  Next: connect your custom domain in Firebase Console → Hosting (see docs/DEPLOYMENT.md)."

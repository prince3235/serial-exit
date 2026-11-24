# syntax=docker/dockerfile:1.7
# ---------------------------------------------------------------------------
# Serial Exit — production image for Google Cloud Run.
# Multi-stage: deps → build → minimal runtime (Next.js "standalone" output).
# Build:  docker build --build-arg NEXT_PUBLIC_SITE_URL=https://your-domain.com -t serial-exit .
# Run:    docker run -p 8080:8080 serial-exit
# ---------------------------------------------------------------------------
ARG NODE_VERSION=22

# ---- 1. Install dependencies (cached unless package*.json changes) ----------
FROM node:${NODE_VERSION}-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- 2. Build ---------------------------------------------------------------
FROM node:${NODE_VERSION}-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* values are inlined into the bundle at BUILD time, so they must be build args.
ARG NEXT_PUBLIC_SITE_URL=https://serialexit.com
ARG NEXT_PUBLIC_POSTHOG_KEY=
ARG NEXT_PUBLIC_POSTHOG_HOST=
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY \
    NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST \
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=$NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- 3. Runtime -------------------------------------------------------------
FROM node:${NODE_VERSION}-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0

# Non-root user
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

# `npm run build` already copied .next/static and public/ into the standalone bundle.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
